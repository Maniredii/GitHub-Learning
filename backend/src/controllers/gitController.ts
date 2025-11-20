import { Request, Response } from 'express';
import { GitEngine } from '../git-engine/GitEngine';
import { CommandExecutor } from '../git-engine/CommandExecutor';
import { Repository } from '../git-engine/models/Repository';

/**
 * In-memory storage for user repositories (session-based)
 * In production, this would be stored in a database
 */
const userRepositories = new Map<string, Repository>();

/**
 * Get or create a repository for a user
 */
function getUserRepository(repositoryId: string): Repository {
  if (!userRepositories.has(repositoryId)) {
    // Create a new repository
    const repo = Repository.create();
    userRepositories.set(repositoryId, repo);
  }
  return userRepositories.get(repositoryId)!;
}

/**
 * POST /api/git/execute
 * Execute a Git command against a repository
 */
export const executeCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { repositoryId, command } = req.body;

    // Validate input
    if (!repositoryId) {
      res.status(400).json({
        error: {
          code: 'MISSING_REPOSITORY_ID',
          message: 'Repository ID is required',
        },
      });
      return;
    }

    if (!command || typeof command !== 'string') {
      res.status(400).json({
        error: {
          code: 'INVALID_COMMAND',
          message: 'Command must be a non-empty string',
        },
      });
      return;
    }

    // Get or create repository
    const repository = getUserRepository(repositoryId);

    // Create GitEngine instance with the repository
    const gitEngine = new GitEngine(repository);

    // Execute the command
    const executor = new CommandExecutor();
    const result = executor.execute(gitEngine, command);

    // Get updated repository state
    const newState = gitEngine.getRepository().toJSON();

    // Return result
    res.status(200).json({
      success: result.success,
      output: result.output || result.message,
      message: result.message,
      error: result.error,
      state: newState,
    });
  } catch (error: any) {
    console.error('Error executing Git command:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while executing the command',
        details: error.message,
      },
    });
  }
};

/**
 * GET /api/git/repository/:id
 * Get the current state of a repository
 */
export const getRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: {
          code: 'MISSING_REPOSITORY_ID',
          message: 'Repository ID is required',
        },
      });
      return;
    }

    // Get or create repository
    const repository = getUserRepository(id);

    // Return repository state
    res.status(200).json({
      state: repository.toJSON(),
    });
  } catch (error: any) {
    console.error('Error getting repository:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while retrieving the repository',
        details: error.message,
      },
    });
  }
};

/**
 * POST /api/git/repository/create
 * Create a new repository with optional initial files
 */
export const createRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { initialFiles } = req.body;

    // Generate a unique repository ID
    const repositoryId = `repo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create repository
    const repository = Repository.create(initialFiles || {});
    userRepositories.set(repositoryId, repository);

    // Return repository ID and state
    res.status(201).json({
      repositoryId,
      state: repository.toJSON(),
    });
  } catch (error: any) {
    console.error('Error creating repository:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while creating the repository',
        details: error.message,
      },
    });
  }
};

/**
 * PUT /api/git/repository/:id
 * Update a repository state (useful for restoring from database)
 */
export const updateRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!id) {
      res.status(400).json({
        error: {
          code: 'MISSING_REPOSITORY_ID',
          message: 'Repository ID is required',
        },
      });
      return;
    }

    if (!state) {
      res.status(400).json({
        error: {
          code: 'MISSING_STATE',
          message: 'Repository state is required',
        },
      });
      return;
    }

    // Restore repository from JSON
    const repository = Repository.fromJSON(state);
    userRepositories.set(id, repository);

    res.status(200).json({
      message: 'Repository updated successfully',
      state: repository.toJSON(),
    });
  } catch (error: any) {
    console.error('Error updating repository:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while updating the repository',
        details: error.message,
      },
    });
  }
};

/**
 * DELETE /api/git/repository/:id
 * Delete a repository (cleanup)
 */
export const deleteRepository = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: {
          code: 'MISSING_REPOSITORY_ID',
          message: 'Repository ID is required',
        },
      });
      return;
    }

    // Delete repository
    const existed = userRepositories.delete(id);

    if (!existed) {
      res.status(404).json({
        error: {
          code: 'REPOSITORY_NOT_FOUND',
          message: 'Repository not found',
        },
      });
      return;
    }

    res.status(200).json({
      message: 'Repository deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting repository:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while deleting the repository',
        details: error.message,
      },
    });
  }
};
