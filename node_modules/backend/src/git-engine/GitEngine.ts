import { Repository, Commit, Branch } from './models';
import { FileTree } from 'shared/src/types';

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

  constructor(repository?: Repository) {
    this.repository = repository || Repository.create();
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
        error: `File '${filePath}' not found in working directory`
      };
    }

    // Add file to staging area
    this.repository.stagingArea[filePath] = {
      ...this.repository.workingDirectory[filePath]
    };

    return {
      success: true,
      message: `Added '${filePath}' to staging area`,
      output: ''
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
        output: ''
      };
    }

    // Add all files from working directory to staging area
    files.forEach(filePath => {
      this.repository.stagingArea[filePath] = {
        ...this.repository.workingDirectory[filePath]
      };
    });

    return {
      success: true,
      message: `Added ${files.length} file(s) to staging area`,
      output: ''
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
    
    Object.keys(this.repository.workingDirectory).forEach(filePath => {
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
      stagedFiles.forEach(file => {
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
      modifiedFiles.forEach(file => {
        output += `\tmodified:   ${file}\n`;
      });
    }

    // Untracked files
    if (untrackedFiles.length > 0) {
      output += '\nUntracked files:\n';
      output += '  (use "git add <file>..." to include in what will be committed)\n\n';
      untrackedFiles.forEach(file => {
        output += `\t${file}\n`;
      });
    }

    // Clean working directory message
    if (stagedFiles.length === 0 && modifiedFiles.length === 0 && untrackedFiles.length === 0) {
      output += '\nnothing to commit, working tree clean\n';
    } else if (stagedFiles.length === 0 && (modifiedFiles.length > 0 || untrackedFiles.length > 0)) {
      output += '\nno changes added to commit (use "git add" and/or "git commit -a")\n';
    }

    return {
      success: true,
      message: 'Status retrieved',
      output: output
    };
  }

  /**
   * Modify a file in the working directory
   */
  modifyFile(filePath: string, content: string): GitResult {
    this.repository.workingDirectory[filePath] = {
      content: content,
      modified: true
    };

    return {
      success: true,
      message: `Modified file '${filePath}'`,
      output: ''
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
        error: 'File already exists'
      };
    }

    this.repository.workingDirectory[filePath] = {
      content: content,
      modified: true
    };

    return {
      success: true,
      message: `Created file '${filePath}'`,
      output: ''
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
        error: 'File not found'
      };
    }

    delete this.repository.workingDirectory[filePath];

    return {
      success: true,
      message: `Deleted file '${filePath}'`,
      output: ''
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
        error: 'No changes staged for commit'
      };
    }

    // Check if message is provided
    if (!message || message.trim() === '') {
      return {
        success: false,
        message: 'Aborting commit due to empty commit message.',
        error: 'Commit message cannot be empty'
      };
    }

    // Get parent commit
    const currentCommit = this.repository.getCurrentCommit();
    const parentHash = currentCommit ? currentCommit.hash : null;

    // Create tree from staging area
    const tree: FileTree = {};
    Object.keys(this.repository.stagingArea).forEach(filePath => {
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
      output: output
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
        error: 'No commits in repository'
      };
    }

    // Get commit history
    const history = this.getCommitHistory(currentCommit.hash);

    // Apply max count limit if specified
    const commits = options?.maxCount 
      ? history.slice(0, options.maxCount) 
      : history;

    if (commits.length === 0) {
      return {
        success: false,
        message: 'No commits found',
        error: 'No commits in history'
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
      output: output
    };
  }

  /**
   * git log --oneline - Display condensed commit history
   */
  logOneline(maxCount?: number): GitResult {
    return this.log({ oneline: true, maxCount });
  }
}
