import { RepositoryState, FileTree } from '../../../shared/src/types';
import { ValidationCriteria } from '../models/Quest';

export interface ValidationResult {
  success: boolean;
  feedback: string;
  details?: Record<string, any>;
}

export class QuestValidationService {
  /**
   * Validate if a quest's objectives are met based on repository state
   */
  validateQuest(
    validationCriteria: ValidationCriteria,
    actualState: RepositoryState,
    expectedState?: RepositoryState
  ): ValidationResult {
    switch (validationCriteria.type) {
      case 'commit_exists':
        return this.validateCommitExists(validationCriteria.parameters, actualState);

      case 'branch_exists':
        return this.validateBranchExists(validationCriteria.parameters, actualState);

      case 'file_content':
        return this.validateFileContent(validationCriteria.parameters, actualState);

      case 'merge_completed':
        return this.validateMergeCompleted(validationCriteria.parameters, actualState);

      case 'custom':
        return this.validateCustom(validationCriteria.parameters, actualState, expectedState);

      default:
        return {
          success: false,
          feedback: 'Unknown validation type',
        };
    }
  }

  /**
   * Validate that commits exist in the repository
   */
  private validateCommitExists(
    parameters: Record<string, any>,
    state: RepositoryState
  ): ValidationResult {
    const { minimumCommits, commitMessage, commitHash } = parameters;

    // Check minimum number of commits
    if (minimumCommits !== undefined) {
      if (state.commits.length < minimumCommits) {
        return {
          success: false,
          feedback: `You need at least ${minimumCommits} commit(s). You currently have ${state.commits.length}.`,
          details: { expected: minimumCommits, actual: state.commits.length },
        };
      }
    }

    // Check for specific commit message
    if (commitMessage !== undefined) {
      const hasMessage = state.commits.some((commit) => commit.message.includes(commitMessage));
      if (!hasMessage) {
        return {
          success: false,
          feedback: `No commit found with message containing "${commitMessage}".`,
          details: { expectedMessage: commitMessage },
        };
      }
    }

    // Check for specific commit hash
    if (commitHash !== undefined) {
      const hasHash = state.commits.some((commit) => commit.hash === commitHash);
      if (!hasHash) {
        return {
          success: false,
          feedback: `Commit with hash "${commitHash}" not found.`,
          details: { expectedHash: commitHash },
        };
      }
    }

    return {
      success: true,
      feedback: 'Great work! Your commits look perfect.',
    };
  }

  /**
   * Validate that branches exist in the repository
   */
  private validateBranchExists(
    parameters: Record<string, any>,
    state: RepositoryState
  ): ValidationResult {
    const { branchName, minimumBranches } = parameters;

    // Check minimum number of branches
    if (minimumBranches !== undefined) {
      if (state.branches.length < minimumBranches) {
        return {
          success: false,
          feedback: `You need at least ${minimumBranches} branch(es). You currently have ${state.branches.length}.`,
          details: { expected: minimumBranches, actual: state.branches.length },
        };
      }
    }

    // Check for specific branch name
    if (branchName !== undefined) {
      const hasBranch = state.branches.some((branch) => branch.name === branchName);
      if (!hasBranch) {
        return {
          success: false,
          feedback: `Branch "${branchName}" not found. Available branches: ${state.branches.map((b) => b.name).join(', ')}`,
          details: {
            expectedBranch: branchName,
            availableBranches: state.branches.map((b) => b.name),
          },
        };
      }
    }

    return {
      success: true,
      feedback: 'Excellent! Your branches are set up correctly.',
    };
  }

  /**
   * Validate file content in the repository
   */
  private validateFileContent(
    parameters: Record<string, any>,
    state: RepositoryState
  ): ValidationResult {
    const { filePath, expectedContent, containsText, fileExists } = parameters;

    // Check if file exists
    if (fileExists !== undefined) {
      const exists = filePath in state.workingDirectory;
      if (fileExists && !exists) {
        return {
          success: false,
          feedback: `File "${filePath}" does not exist in the working directory.`,
          details: { expectedFile: filePath },
        };
      }
      if (!fileExists && exists) {
        return {
          success: false,
          feedback: `File "${filePath}" should not exist.`,
          details: { unexpectedFile: filePath },
        };
      }
    }

    // Check exact content
    if (expectedContent !== undefined) {
      const file = state.workingDirectory[filePath];
      if (!file) {
        return {
          success: false,
          feedback: `File "${filePath}" not found.`,
        };
      }
      if (file.content !== expectedContent) {
        return {
          success: false,
          feedback: `File "${filePath}" content doesn't match expected content.`,
          details: { expected: expectedContent, actual: file.content },
        };
      }
    }

    // Check if content contains specific text
    if (containsText !== undefined) {
      const file = state.workingDirectory[filePath];
      if (!file) {
        return {
          success: false,
          feedback: `File "${filePath}" not found.`,
        };
      }
      if (!file.content.includes(containsText)) {
        return {
          success: false,
          feedback: `File "${filePath}" should contain "${containsText}".`,
          details: { expectedText: containsText },
        };
      }
    }

    return {
      success: true,
      feedback: 'Perfect! Your file content is correct.',
    };
  }

  /**
   * Validate that a merge has been completed
   */
  private validateMergeCompleted(
    parameters: Record<string, any>,
    state: RepositoryState
  ): ValidationResult {
    const { sourceBranch, targetBranch, noConflicts } = parameters;

    // Check if there's a merge commit (commit with multiple parents)
    const mergeCommit = state.commits.find((commit) => commit.parents && commit.parents.length > 1);

    if (!mergeCommit) {
      return {
        success: false,
        feedback: "No merge commit found. Make sure you've completed the merge.",
      };
    }

    // Check for conflicts if required
    if (noConflicts) {
      // Check if any files have conflict markers
      const hasConflicts = Object.values(state.workingDirectory).some(
        (file) =>
          file.content.includes('<<<<<<<') ||
          file.content.includes('>>>>>>>') ||
          file.content.includes('=======')
      );

      if (hasConflicts) {
        return {
          success: false,
          feedback:
            'There are still unresolved conflicts in your files. Please resolve them before completing the merge.',
        };
      }
    }

    return {
      success: true,
      feedback: "Excellent merge! You've successfully combined the branches.",
    };
  }

  /**
   * Validate custom criteria
   */
  private validateCustom(
    parameters: Record<string, any>,
    actualState: RepositoryState,
    expectedState?: RepositoryState
  ): ValidationResult {
    const { requiresManualCompletion, checkRepositoryInitialized, checkStagingArea, minimumFiles } =
      parameters;

    // Manual completion (always passes - used for tutorial/reading quests)
    if (requiresManualCompletion) {
      return {
        success: true,
        feedback: 'Quest completed! Continue to the next challenge.',
      };
    }

    // Check if repository is initialized
    if (checkRepositoryInitialized) {
      if (actualState.branches.length === 0) {
        return {
          success: false,
          feedback: 'Repository not initialized. Use git init to create a new repository.',
        };
      }
      return {
        success: true,
        feedback: 'Repository initialized successfully!',
      };
    }

    // Check staging area
    if (checkStagingArea) {
      const stagedFiles = Object.keys(actualState.stagingArea).length;

      if (minimumFiles !== undefined && stagedFiles < minimumFiles) {
        return {
          success: false,
          feedback: `You need to stage at least ${minimumFiles} file(s). Currently staged: ${stagedFiles}`,
          details: { expected: minimumFiles, actual: stagedFiles },
        };
      }

      if (stagedFiles === 0) {
        return {
          success: false,
          feedback: 'No files staged. Use git add to stage your changes.',
        };
      }

      return {
        success: true,
        feedback: 'Files staged successfully!',
      };
    }

    // Compare with expected state if provided
    if (expectedState) {
      return this.compareStates(actualState, expectedState);
    }

    return {
      success: false,
      feedback: 'Unable to validate quest completion.',
    };
  }

  /**
   * Compare actual state with expected state
   */
  private compareStates(
    actualState: RepositoryState,
    expectedState: RepositoryState
  ): ValidationResult {
    // Compare commits
    if (actualState.commits.length !== expectedState.commits.length) {
      return {
        success: false,
        feedback: `Expected ${expectedState.commits.length} commits, but found ${actualState.commits.length}.`,
      };
    }

    // Compare branches
    if (actualState.branches.length !== expectedState.branches.length) {
      return {
        success: false,
        feedback: `Expected ${expectedState.branches.length} branches, but found ${actualState.branches.length}.`,
      };
    }

    // Compare working directory files
    const expectedFiles = Object.keys(expectedState.workingDirectory);
    const actualFiles = Object.keys(actualState.workingDirectory);

    if (expectedFiles.length !== actualFiles.length) {
      return {
        success: false,
        feedback: `Expected ${expectedFiles.length} files, but found ${actualFiles.length}.`,
      };
    }

    return {
      success: true,
      feedback: 'Perfect! Your repository state matches the expected state.',
    };
  }
}

export default new QuestValidationService();
