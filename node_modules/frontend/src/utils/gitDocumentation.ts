export interface GitCommandDoc {
  command: string;
  description: string;
  usage: string;
  examples: string[];
  learnMoreUrl: string;
}

export const gitDocumentation: Record<string, GitCommandDoc> = {
  'git add': {
    command: 'git add',
    description: 'Add file contents to the staging area',
    usage: 'git add <file> or git add .',
    examples: ['git add file.txt', 'git add .', 'git add src/'],
    learnMoreUrl: 'https://git-scm.com/docs/git-add',
  },
  'git commit': {
    command: 'git commit',
    description: 'Record changes to the repository',
    usage: 'git commit -m "<message>"',
    examples: ['git commit -m "Add new feature"', 'git commit -m "Fix bug"'],
    learnMoreUrl: 'https://git-scm.com/docs/git-commit',
  },
  'git status': {
    command: 'git status',
    description: 'Show the working tree status',
    usage: 'git status',
    examples: ['git status'],
    learnMoreUrl: 'https://git-scm.com/docs/git-status',
  },
  'git log': {
    command: 'git log',
    description: 'Show commit logs',
    usage: 'git log [options]',
    examples: ['git log', 'git log --oneline', 'git log --graph'],
    learnMoreUrl: 'https://git-scm.com/docs/git-log',
  },
  'git branch': {
    command: 'git branch',
    description: 'List, create, or delete branches',
    usage: 'git branch [branch-name]',
    examples: ['git branch', 'git branch feature', 'git branch -d old-branch'],
    learnMoreUrl: 'https://git-scm.com/docs/git-branch',
  },
  'git checkout': {
    command: 'git checkout',
    description: 'Switch branches or restore working tree files',
    usage: 'git checkout <branch> or git checkout -- <file>',
    examples: [
      'git checkout main',
      'git checkout -b new-branch',
      'git checkout -- file.txt',
    ],
    learnMoreUrl: 'https://git-scm.com/docs/git-checkout',
  },
  'git merge': {
    command: 'git merge',
    description: 'Join two or more development histories together',
    usage: 'git merge <branch>',
    examples: ['git merge feature', 'git merge --no-ff feature'],
    learnMoreUrl: 'https://git-scm.com/docs/git-merge',
  },
  'git reset': {
    command: 'git reset',
    description: 'Reset current HEAD to the specified state',
    usage: 'git reset [--soft | --mixed | --hard] [<commit>]',
    examples: ['git reset HEAD file.txt', 'git reset --hard HEAD~1'],
    learnMoreUrl: 'https://git-scm.com/docs/git-reset',
  },
  'git remote': {
    command: 'git remote',
    description: 'Manage set of tracked repositories',
    usage: 'git remote [add | remove | -v]',
    examples: ['git remote -v', 'git remote add origin <url>'],
    learnMoreUrl: 'https://git-scm.com/docs/git-remote',
  },
  'git push': {
    command: 'git push',
    description: 'Update remote refs along with associated objects',
    usage: 'git push <remote> <branch>',
    examples: ['git push origin main', 'git push -u origin feature'],
    learnMoreUrl: 'https://git-scm.com/docs/git-push',
  },
  'git pull': {
    command: 'git pull',
    description: 'Fetch from and integrate with another repository or a local branch',
    usage: 'git pull <remote> <branch>',
    examples: ['git pull origin main', 'git pull'],
    learnMoreUrl: 'https://git-scm.com/docs/git-pull',
  },
  'git clone': {
    command: 'git clone',
    description: 'Clone a repository into a new directory',
    usage: 'git clone <url>',
    examples: ['git clone https://github.com/user/repo.git'],
    learnMoreUrl: 'https://git-scm.com/docs/git-clone',
  },
  'git fetch': {
    command: 'git fetch',
    description: 'Download objects and refs from another repository',
    usage: 'git fetch <remote>',
    examples: ['git fetch origin', 'git fetch --all'],
    learnMoreUrl: 'https://git-scm.com/docs/git-fetch',
  },
};

/**
 * Extract git command from a command string
 */
export function extractGitCommand(commandString: string): string | null {
  const trimmed = commandString.trim().toLowerCase();
  
  // Match git commands
  const match = trimmed.match(/^git\s+(\w+)/);
  if (match) {
    return `git ${match[1]}`;
  }
  
  return null;
}

/**
 * Get documentation for a command
 */
export function getCommandDocumentation(commandString: string): GitCommandDoc | null {
  const command = extractGitCommand(commandString);
  if (!command) return null;
  
  return gitDocumentation[command] || null;
}

/**
 * Get contextual hint based on error type
 */
export function getContextualHint(errorMessage: string, commandString: string): string | null {
  const lowerError = errorMessage.toLowerCase();
  const lowerCommand = commandString.toLowerCase();
  
  // Common error patterns and hints
  if (lowerError.includes('not a git command') || lowerError.includes('unknown command')) {
    return 'Check your spelling. Common Git commands include: add, commit, status, log, branch, checkout, merge.';
  }
  
  if (lowerError.includes('nothing to commit') && lowerCommand.includes('commit')) {
    return 'You need to stage files first using "git add" before you can commit.';
  }
  
  if (lowerError.includes('no changes added') && lowerCommand.includes('commit')) {
    return 'Use "git add <file>" to stage your changes before committing.';
  }
  
  if (lowerError.includes('not a git repository')) {
    return 'You need to initialize a Git repository first with "git init".';
  }
  
  if (lowerError.includes('pathspec') && lowerError.includes('did not match')) {
    return 'The file you specified does not exist. Use "git status" to see available files.';
  }
  
  if (lowerError.includes('branch') && lowerError.includes('not found')) {
    return 'The branch does not exist. Use "git branch" to see available branches.';
  }
  
  if (lowerError.includes('conflict') || lowerError.includes('merge')) {
    return 'You have a merge conflict. Edit the conflicted files to resolve the markers, then add and commit.';
  }
  
  if (lowerCommand.includes('checkout') && lowerError.includes('would be overwritten')) {
    return 'You have uncommitted changes. Commit or stash them before switching branches.';
  }
  
  return null;
}
