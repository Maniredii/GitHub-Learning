import { Repository, Commit, Branch } from './models';
import { FileTree } from 'shared/src/types';
import { MergeEngine } from './MergeEngine';

/**
 * Result of a Git operation
 */
export interface GitResult {
  success: boolean;
  message: string;
  output?: string;
  error?: string;
}

/**
 * GitEngine - Main class for simulating Git operations
 * Implements core Git commands like add, commit, status, log, etc.
 */
export class GitEngine {
  private repository: Repository;
  private mergeEngine: MergeEngine;

  constructor(repository?: Repository) {
    this.repository = repository || Repository.create();
    this.mergeEngine = new MergeEngine();
  }

  /**
   * Get the current repository state
   */
  getRepository(): Repository {
    return this.repository;
  }

  /**
   * Set the repository state
   */
  setRepository(repository: Repository): void {
    this.repository = repository;
  }

  /**
   * git add <file> - Stage a specific file
   */
  add(filePath: string): GitResult {
    // Check if file exists in working directory
    if (!this.repository.workingDirectory[filePath]) {
      return {
        success: false,
        message: `fatal: pathspec '${filePath}' did not match any files`,
        error: `File '${filePath}' not found in working directory`,
      };
    }

    // Add file to staging area
    this.repository.stagingArea[filePath] = {
      ...this.repository.workingDirectory[filePath],
    };

    return {
      success: true,
      message: `Added '${filePath}' to staging area`,
      output: '',
    };
  }

  /**
   * git add . - Stage all modified files
   */
  addAll(): GitResult {
    const files = Object.keys(this.repository.workingDirectory);

    if (files.length === 0) {
      return {
        success: true,
        message: 'No files to add',
        output: '',
      };
    }

    // Add all files from working directory to staging area
    files.forEach((filePath) => {
      this.repository.stagingArea[filePath] = {
        ...this.repository.workingDirectory[filePath],
      };
    });

    return {
      success: true,
      message: `Added ${files.length} file(s) to staging area`,
      output: '',
    };
  }

  /**
   * git status - Show working directory and staging area state
   */
  status(): GitResult {
    const currentBranch = this.repository.getCurrentBranch();
    const currentCommit = this.repository.getCurrentCommit();

    let output = '';

    // Branch information
    if (this.repository.isDetachedHead()) {
      output += `HEAD detached at ${this.repository.head.substring(0, 7)}\n`;
    } else {
      output += `On branch ${this.repository.head}\n`;
    }

    // Check if there are any commits
    if (!currentCommit) {
      output += '\nNo commits yet\n';
    }

    // Get staged files
    const stagedFiles = Object.keys(this.repository.stagingArea);

    // Get modified files (in working directory but different from last commit or not staged)
    const modifiedFiles: string[] = [];
    const untrackedFiles: string[] = [];

    const lastCommitTree = currentCommit?.tree || {};

    Object.keys(this.repository.workingDirectory).forEach((filePath) => {
      const isStaged = stagedFiles.includes(filePath);
      const inLastCommit = lastCommitTree[filePath] !== undefined;

      if (!isStaged && !inLastCommit) {
        untrackedFiles.push(filePath);
      } else if (!isStaged && inLastCommit) {
        const workingContent = this.repository.workingDirectory[filePath].content;
        const committedContent = lastCommitTree[filePath].content;
        if (workingContent !== committedContent) {
          modifiedFiles.push(filePath);
        }
      }
    });

    // Changes to be committed
    if (stagedFiles.length > 0) {
      output += '\nChanges to be committed:\n';
      output += '  (use "git reset HEAD <file>..." to unstage)\n\n';
      stagedFiles.forEach((file) => {
        const isNew = !lastCommitTree[file];
        const status = isNew ? 'new file' : 'modified';
        output += `\t${status}:   ${file}\n`;
      });
    }

    // Changes not staged for commit
    if (modifiedFiles.length > 0) {
      output += '\nChanges not staged for commit:\n';
      output += '  (use "git add <file>..." to update what will be committed)\n';
      output += '  (use "git checkout -- <file>..." to discard changes in working directory)\n\n';
      modifiedFiles.forEach((file) => {
        output += `\tmodified:   ${file}\n`;
      });
    }

    // Untracked files
    if (untrackedFiles.length > 0) {
      output += '\nUntracked files:\n';
      output += '  (use "git add <file>..." to include in what will be committed)\n\n';
      untrackedFiles.forEach((file) => {
        output += `\t${file}\n`;
      });
    }

    // Clean working directory message
    if (stagedFiles.length === 0 && modifiedFiles.length === 0 && untrackedFiles.length === 0) {
      output += '\nnothing to commit, working tree clean\n';
    } else if (
      stagedFiles.length === 0 &&
      (modifiedFiles.length > 0 || untrackedFiles.length > 0)
    ) {
      output += '\nno changes added to commit (use "git add" and/or "git commit -a")\n';
    }

    return {
      success: true,
      message: 'Status retrieved',
      output: output,
    };
  }

  /**
   * Modify a file in the working directory
   */
  modifyFile(filePath: string, content: string): GitResult {
    this.repository.workingDirectory[filePath] = {
      content: content,
      modified: true,
    };

    return {
      success: true,
      message: `Modified file '${filePath}'`,
      output: '',
    };
  }

  /**
   * Create a new file in the working directory
   */
  createFile(filePath: string, content: string = ''): GitResult {
    if (this.repository.workingDirectory[filePath]) {
      return {
        success: false,
        message: `File '${filePath}' already exists`,
        error: 'File already exists',
      };
    }

    this.repository.workingDirectory[filePath] = {
      content: content,
      modified: true,
    };

    return {
      success: true,
      message: `Created file '${filePath}'`,
      output: '',
    };
  }

  /**
   * Delete a file from the working directory
   */
  deleteFile(filePath: string): GitResult {
    if (!this.repository.workingDirectory[filePath]) {
      return {
        success: false,
        message: `File '${filePath}' not found`,
        error: 'File not found',
      };
    }

    delete this.repository.workingDirectory[filePath];

    return {
      success: true,
      message: `Deleted file '${filePath}'`,
      output: '',
    };
  }

  /**
   * git commit -m "<message>" - Create a commit from staged changes
   */
  commit(message: string, author: string = 'Chrono-Coder'): GitResult {
    // Check if there are staged changes
    const stagedFiles = Object.keys(this.repository.stagingArea);
    if (stagedFiles.length === 0) {
      return {
        success: false,
        message: 'nothing to commit, working tree clean',
        error: 'No changes staged for commit',
      };
    }

    // Check if message is provided
    if (!message || message.trim() === '') {
      return {
        success: false,
        message: 'Aborting commit due to empty commit message.',
        error: 'Commit message cannot be empty',
      };
    }

    // Get parent commit
    const currentCommit = this.repository.getCurrentCommit();
    const parentHash = currentCommit ? currentCommit.hash : null;

    // Create tree from staging area
    const tree: FileTree = {};
    Object.keys(this.repository.stagingArea).forEach((filePath) => {
      tree[filePath] = { ...this.repository.stagingArea[filePath] };
    });

    // Create the commit
    const commit = Commit.create(message, author, tree, parentHash);

    // Add commit to repository
    this.repository.addCommit(commit);

    // Update current branch to point to new commit
    const currentBranch = this.repository.getCurrentBranch();
    if (currentBranch) {
      currentBranch.updateCommit(commit.hash);
    } else {
      // If HEAD is detached, update HEAD directly
      this.repository.updateHead(commit.hash);
    }

    // Update working directory to match the commit
    this.repository.workingDirectory = { ...tree };

    // Clear staging area
    this.repository.stagingArea = {};

    const output = `[${this.repository.head} ${commit.shortHash}] ${message}\n ${stagedFiles.length} file(s) changed`;

    return {
      success: true,
      message: 'Commit created successfully',
      output: output,
    };
  }

  /**
   * Get the commit history from a given commit
   */
  private getCommitHistory(startHash: string | null): Commit[] {
    const history: Commit[] = [];
    let currentHash = startHash;

    while (currentHash) {
      const commit = this.repository.getCommit(currentHash);
      if (!commit) break;

      history.push(commit);
      currentHash = commit.parent;
    }

    return history;
  }

  /**
   * git log - Display commit history from HEAD
   */
  log(options?: { oneline?: boolean; maxCount?: number }): GitResult {
    const currentCommit = this.repository.getCurrentCommit();

    if (!currentCommit) {
      return {
        success: false,
        message: 'fatal: your current branch does not have any commits yet',
        error: 'No commits in repository',
      };
    }

    // Get commit history
    const history = this.getCommitHistory(currentCommit.hash);

    // Apply max count limit if specified
    const commits = options?.maxCount ? history.slice(0, options.maxCount) : history;

    if (commits.length === 0) {
      return {
        success: false,
        message: 'No commits found',
        error: 'No commits in history',
      };
    }

    // Format output
    let output = '';
    const oneline = options?.oneline || false;

    commits.forEach((commit, index) => {
      if (oneline) {
        output += commit.format(true);
      } else {
        output += commit.format(false);
        // Add blank line between commits (except for the last one)
        if (index < commits.length - 1) {
          output += '\n';
        }
      }

      if (oneline && index < commits.length - 1) {
        output += '\n';
      }
    });

    return {
      success: true,
      message: 'Log retrieved',
      output: output,
    };
  }

  /**
   * git log --oneline - Display condensed commit history
   */
  logOneline(maxCount?: number): GitResult {
    return this.log({ oneline: true, maxCount });
  }

  /**
   * git branch - List all branches or create a new branch
   */
  branch(branchName?: string): GitResult {
    // List all branches if no name provided
    if (!branchName) {
      const branches = this.repository.getBranchesArray();

      if (branches.length === 0) {
        return {
          success: false,
          message: 'No branches found',
          error: 'Repository has no branches',
        };
      }

      let output = '';
      branches.forEach((branch) => {
        const prefix = branch.name === this.repository.head ? '* ' : '  ';
        output += `${prefix}${branch.name}\n`;
      });

      return {
        success: true,
        message: 'Branches listed',
        output: output,
      };
    }

    // Create a new branch
    // Check if branch already exists
    if (this.repository.getBranch(branchName)) {
      return {
        success: false,
        message: `fatal: A branch named '${branchName}' already exists.`,
        error: `Branch '${branchName}' already exists`,
      };
    }

    // Get current commit
    const currentCommit = this.repository.getCurrentCommit();
    if (!currentCommit) {
      return {
        success: false,
        message: "fatal: Not a valid object name: 'HEAD'.",
        error: 'Cannot create branch without any commits',
      };
    }

    // Create new branch at current commit
    const newBranch = Branch.create(branchName, currentCommit.hash);
    this.repository.addBranch(newBranch);

    return {
      success: true,
      message: `Branch '${branchName}' created`,
      output: '',
    };
  }

  /**
   * git checkout <branch> - Switch to a different branch
   * git checkout -b <name> - Create and switch to a new branch
   */
  checkout(target: string, createBranch: boolean = false): GitResult {
    // Handle checkout -b (create and switch)
    if (createBranch) {
      // Create the branch first
      const createResult = this.branch(target);
      if (!createResult.success) {
        return createResult;
      }
      // Continue to switch to the new branch
    }

    // Check if target is a branch
    const targetBranch = this.repository.getBranch(target);

    if (targetBranch) {
      // Switch to branch
      // Check if we have uncommitted changes
      const hasUncommittedChanges = Object.keys(this.repository.stagingArea).length > 0;

      if (hasUncommittedChanges) {
        return {
          success: false,
          message:
            'error: Your local changes to the following files would be overwritten by checkout:\nPlease commit your changes or stash them before you switch branches.',
          error: 'Uncommitted changes in staging area',
        };
      }

      // Update HEAD to point to the branch
      this.repository.updateHead(target);

      // Update working directory to match the branch's commit
      const branchCommit = this.repository.getCommit(targetBranch.commitHash);
      if (branchCommit) {
        this.repository.workingDirectory = { ...branchCommit.tree };
      } else {
        // Branch points to no commit (new repository)
        this.repository.workingDirectory = {};
      }

      const output = createBranch
        ? `Switched to a new branch '${target}'`
        : `Switched to branch '${target}'`;

      return {
        success: true,
        message: output,
        output: output,
      };
    }

    // Check if target is a commit hash
    const targetCommit = this.repository.getCommit(target);
    if (targetCommit) {
      // Detached HEAD state
      this.repository.updateHead(target);
      this.repository.workingDirectory = { ...targetCommit.tree };

      return {
        success: true,
        message: `HEAD is now at ${targetCommit.shortHash} ${targetCommit.message}`,
        output: `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state.`,
      };
    }

    // Target not found
    return {
      success: false,
      message: `error: pathspec '${target}' did not match any file(s) known to git`,
      error: `Branch or commit '${target}' not found`,
    };
  }

  /**
   * git merge <branch> - Merge specified branch into current branch
   */
  merge(branchName: string): GitResult {
    // Check if we're on a branch
    const currentBranch = this.repository.getCurrentBranch();
    if (!currentBranch) {
      return {
        success: false,
        message: 'fatal: You are not currently on a branch.',
        error: 'Cannot merge in detached HEAD state',
      };
    }

    // Check if target branch exists
    const targetBranch = this.repository.getBranch(branchName);
    if (!targetBranch) {
      return {
        success: false,
        message: `fatal: branch '${branchName}' not found`,
        error: `Branch '${branchName}' does not exist`,
      };
    }

    // Check if trying to merge into itself
    if (currentBranch.name === branchName) {
      return {
        success: false,
        message: `Already on '${branchName}'`,
        error: 'Cannot merge branch into itself',
      };
    }

    // Check for uncommitted changes
    if (Object.keys(this.repository.stagingArea).length > 0) {
      return {
        success: false,
        message:
          'error: You have not concluded your merge (MERGE_HEAD exists).\nPlease, commit your changes before you merge.',
        error: 'Uncommitted changes in staging area',
      };
    }

    const currentCommit = this.repository.getCurrentCommit();
    const targetCommit = this.repository.getCommit(targetBranch.commitHash);

    if (!currentCommit) {
      return {
        success: false,
        message: 'fatal: No commits yet',
        error: 'Cannot merge without commits',
      };
    }

    if (!targetCommit) {
      return {
        success: false,
        message: `fatal: Commit not found for branch '${branchName}'`,
        error: 'Target branch has no commits',
      };
    }

    // Check if already up to date
    if (currentCommit.hash === targetCommit.hash) {
      return {
        success: true,
        message: 'Already up to date.',
        output: 'Already up to date.',
      };
    }

    // Check if fast-forward merge is possible
    if (this.mergeEngine.canFastForward(this.repository, targetCommit.hash)) {
      const mergeResult = this.mergeEngine.performFastForward(this.repository, targetCommit.hash);

      return {
        success: true,
        message: 'Fast-forward merge completed',
        output: `Updating ${currentCommit.shortHash}..${targetCommit.shortHash}\nFast-forward`,
      };
    }

    // Perform three-way merge
    const mergeResult = this.mergeEngine.performThreeWayMerge(
      this.repository,
      currentCommit,
      targetCommit
    );

    if (!mergeResult.success) {
      // Merge conflicts detected
      // Update working directory with conflict markers
      if (mergeResult.mergedTree) {
        this.repository.workingDirectory = mergeResult.mergedTree;
        // Stage the conflicted files
        this.repository.stagingArea = { ...mergeResult.mergedTree };
      }

      const conflictFiles = mergeResult.conflicts.map((c) => c.filePath).join('\n\t');
      const output = `Auto-merging failed; fix conflicts and then commit the result.\nCONFLICT (content): Merge conflict in:\n\t${conflictFiles}`;

      return {
        success: false,
        message: mergeResult.message || 'Merge conflicts detected',
        output: output,
        error: 'Merge conflicts must be resolved',
      };
    }

    // Successful automatic merge - create merge commit
    if (mergeResult.mergedTree) {
      // Update working directory and staging area
      this.repository.workingDirectory = mergeResult.mergedTree;
      this.repository.stagingArea = mergeResult.mergedTree;

      // Create merge commit with two parents
      const mergeMessage = `Merge branch '${branchName}' into ${currentBranch.name}`;
      const mergeCommit = Commit.create(
        mergeMessage,
        'Chrono-Coder',
        mergeResult.mergedTree,
        currentCommit.hash,
        [currentCommit.hash, targetCommit.hash]
      );

      this.repository.addCommit(mergeCommit);
      currentBranch.updateCommit(mergeCommit.hash);

      // Clear staging area
      this.repository.stagingArea = {};

      return {
        success: true,
        message: 'Merge completed successfully',
        output: `Merge made by the 'recursive' strategy.`,
      };
    }

    return {
      success: false,
      message: 'Merge failed',
      error: 'Unknown merge error',
    };
  }

  /**
   * git reset HEAD <file> - Unstage a file
   * git reset --hard <commit> - Reset to a specific commit
   */
  reset(target?: string, mode: 'mixed' | 'hard' = 'mixed', filePath?: string): GitResult {
    // git reset HEAD <file> - unstage specific file
    if (target === 'HEAD' && filePath) {
      if (!this.repository.stagingArea[filePath]) {
        return {
          success: false,
          message: `fatal: pathspec '${filePath}' did not match any files`,
          error: `File '${filePath}' is not staged`,
        };
      }

      // Remove file from staging area
      delete this.repository.stagingArea[filePath];

      return {
        success: true,
        message: `Unstaged changes for '${filePath}'`,
        output: `Unstaged changes after reset:\nM\t${filePath}`,
      };
    }

    // git reset --hard <commit> - reset to specific commit
    if (mode === 'hard' && target) {
      // Find the target commit
      let targetCommit = this.repository.getCommit(target);

      // Try to find by branch name if not found as commit
      if (!targetCommit) {
        const branch = this.repository.getBranch(target);
        if (branch) {
          targetCommit = this.repository.getCommit(branch.commitHash);
        }
      }

      if (!targetCommit) {
        return {
          success: false,
          message: `fatal: ambiguous argument '${target}': unknown revision or path not in the working tree.`,
          error: `Commit or branch '${target}' not found`,
        };
      }

      // Update current branch or HEAD
      const currentBranch = this.repository.getCurrentBranch();
      if (currentBranch) {
        currentBranch.updateCommit(targetCommit.hash);
      } else {
        this.repository.updateHead(targetCommit.hash);
      }

      // Reset working directory and staging area
      this.repository.workingDirectory = { ...targetCommit.tree };
      this.repository.stagingArea = {};

      return {
        success: true,
        message: `HEAD is now at ${targetCommit.shortHash} ${targetCommit.message}`,
        output: `HEAD is now at ${targetCommit.shortHash} ${targetCommit.message}`,
      };
    }

    return {
      success: false,
      message: 'fatal: Invalid reset command',
      error: 'Invalid reset parameters',
    };
  }

  /**
   * git checkout -- <file> - Discard working directory changes
   */
  checkoutFile(filePath: string): GitResult {
    const currentCommit = this.repository.getCurrentCommit();

    if (!currentCommit) {
      return {
        success: false,
        message: 'fatal: No commits yet',
        error: 'Cannot checkout file without commits',
      };
    }

    // Check if file exists in the last commit
    if (!currentCommit.tree[filePath]) {
      return {
        success: false,
        message: `error: pathspec '${filePath}' did not match any file(s) known to git`,
        error: `File '${filePath}' not found in HEAD`,
      };
    }

    // Restore file from last commit
    this.repository.workingDirectory[filePath] = {
      ...currentCommit.tree[filePath],
    };

    return {
      success: true,
      message: `Restored '${filePath}' from HEAD`,
      output: '',
    };
  }
}
