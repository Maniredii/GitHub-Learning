import { GitEngine, GitResult } from './GitEngine';
import { CommandParser, ParsedCommand } from './CommandParser';

/**
 * CommandExecutor - Maps parsed commands to GitEngine methods
 */
export class CommandExecutor {
  private parser: CommandParser;

  constructor() {
    this.parser = new CommandParser();
  }

  /**
   * Execute a Git command string against a GitEngine instance
   */
  execute(gitEngine: GitEngine, commandString: string): GitResult {
    // Parse the command
    const parsed = this.parser.parse(commandString);

    // Validate the command
    const validation = this.parser.validate(parsed);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid command',
        error: validation.error,
      };
    }

    // Route to appropriate handler
    try {
      return this.routeCommand(gitEngine, parsed);
    } catch (error: any) {
      return {
        success: false,
        message: `Error executing command: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Route a parsed command to the appropriate GitEngine method
   */
  private routeCommand(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    switch (parsed.command) {
      case 'add':
        return this.handleAdd(gitEngine, parsed);

      case 'commit':
        return this.handleCommit(gitEngine, parsed);

      case 'status':
        return this.handleStatus(gitEngine, parsed);

      case 'log':
        return this.handleLog(gitEngine, parsed);

      case 'branch':
        return this.handleBranch(gitEngine, parsed);

      case 'checkout':
        return this.handleCheckout(gitEngine, parsed);

      case 'merge':
        return this.handleMerge(gitEngine, parsed);

      case 'reset':
        return this.handleReset(gitEngine, parsed);

      case 'remote':
        return this.handleRemote(gitEngine, parsed);

      case 'clone':
        return this.handleClone(gitEngine, parsed);

      case 'push':
        return this.handlePush(gitEngine, parsed);

      case 'pull':
        return this.handlePull(gitEngine, parsed);

      case 'fetch':
        return this.handleFetch(gitEngine, parsed);

      default:
        return {
          success: false,
          message: `Command '${parsed.command}' is not yet implemented`,
          error: 'Command not implemented',
        };
    }
  }

  /**
   * Handle 'git add' command
   */
  private handleAdd(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length === 0) {
      return {
        success: false,
        message: "Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?",
        error: 'No files specified',
      };
    }

    const target = parsed.arguments[0];

    if (target === '.' || target === '-A' || target === '--all') {
      return gitEngine.addAll();
    }

    return gitEngine.add(target);
  }

  /**
   * Handle 'git commit' command
   */
  private handleCommit(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    const message = parsed.flags['m'] || parsed.flags['message'];

    if (!message) {
      return {
        success: false,
        message:
          'Aborting commit due to empty commit message.\nUse \'git commit -m "message"\' to provide a commit message.',
        error: 'No commit message provided',
      };
    }

    return gitEngine.commit(message as string);
  }

  /**
   * Handle 'git status' command
   */
  private handleStatus(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    return gitEngine.status();
  }

  /**
   * Handle 'git log' command
   */
  private handleLog(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    const oneline = parsed.flags['oneline'] === true;
    const maxCount = parsed.flags['n'] ? parseInt(parsed.flags['n'] as string, 10) : undefined;

    return gitEngine.log({ oneline, maxCount });
  }

  /**
   * Handle 'git branch' command
   */
  private handleBranch(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length === 0) {
      // List branches
      return gitEngine.branch();
    }

    // Create branch
    const branchName = parsed.arguments[0];
    return gitEngine.branch(branchName);
  }

  /**
   * Handle 'git checkout' command
   */
  private handleCheckout(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    // Check for 'git checkout -- <file>' pattern
    if (parsed.arguments.length === 2 && parsed.arguments[0] === '--') {
      const filePath = parsed.arguments[1];
      return gitEngine.checkoutFile(filePath);
    }

    // Check for 'git checkout -b <branch>' pattern
    const createBranch = parsed.flags['b'] === true;

    if (parsed.arguments.length === 0) {
      return {
        success: false,
        message:
          'You must specify a branch name or commit hash.\nUsage: git checkout <branch> or git checkout -b <new-branch>',
        error: 'No target specified',
      };
    }

    const target = parsed.arguments[0];
    return gitEngine.checkout(target, createBranch);
  }

  /**
   * Handle 'git merge' command
   */
  private handleMerge(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length === 0) {
      return {
        success: false,
        message: 'You must specify which branch to merge.\nUsage: git merge <branch>',
        error: 'No branch specified',
      };
    }

    const branchName = parsed.arguments[0];
    return gitEngine.merge(branchName);
  }

  /**
   * Handle 'git reset' command
   */
  private handleReset(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    const hard = parsed.flags['hard'] === true;
    const mode = hard ? 'hard' : 'mixed';

    // Check for 'git reset HEAD <file>' pattern
    if (parsed.arguments.length === 2 && parsed.arguments[0] === 'HEAD') {
      const filePath = parsed.arguments[1];
      return gitEngine.reset('HEAD', mode, filePath);
    }

    // Check for 'git reset --hard <commit>' pattern
    if (parsed.arguments.length === 1) {
      const target = parsed.arguments[0];
      return gitEngine.reset(target, mode);
    }

    return {
      success: false,
      message: 'Invalid reset command.\nUsage: git reset HEAD <file> or git reset --hard <commit>',
      error: 'Invalid reset syntax',
    };
  }

  /**
   * Handle 'git remote' command
   */
  private handleRemote(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    const subcommand = parsed.subcommand || parsed.arguments[0];

    if (!subcommand || subcommand === '-v') {
      // List remotes
      return gitEngine.remoteList();
    }

    if (subcommand === 'add') {
      // git remote add <name> <url>
      const args = parsed.subcommand ? parsed.arguments : parsed.arguments.slice(1);

      if (args.length < 2) {
        return {
          success: false,
          message: 'Usage: git remote add <name> <url>',
          error: 'Missing remote name or URL',
        };
      }

      const [name, url] = args;
      return gitEngine.remoteAdd(name, url);
    }

    return {
      success: false,
      message: `Unknown remote subcommand: ${subcommand}`,
      error: 'Invalid remote subcommand',
    };
  }

  /**
   * Handle 'git clone' command
   */
  private handleClone(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length === 0) {
      return {
        success: false,
        message: 'You must specify a repository to clone.\nUsage: git clone <url>',
        error: 'No repository URL specified',
      };
    }

    const url = parsed.arguments[0];
    return gitEngine.clone(url);
  }

  /**
   * Handle 'git push' command
   */
  private handlePush(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length < 2) {
      return {
        success: false,
        message: 'Usage: git push <remote> <branch>',
        error: 'Missing remote or branch name',
      };
    }

    const [remoteName, branchName] = parsed.arguments;
    return gitEngine.push(remoteName, branchName);
  }

  /**
   * Handle 'git pull' command
   */
  private handlePull(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length < 2) {
      return {
        success: false,
        message: 'Usage: git pull <remote> <branch>',
        error: 'Missing remote or branch name',
      };
    }

    const [remoteName, branchName] = parsed.arguments;
    return gitEngine.pull(remoteName, branchName);
  }

  /**
   * Handle 'git fetch' command
   */
  private handleFetch(gitEngine: GitEngine, parsed: ParsedCommand): GitResult {
    if (parsed.arguments.length === 0) {
      return {
        success: false,
        message: 'Usage: git fetch <remote>',
        error: 'No remote specified',
      };
    }

    const remoteName = parsed.arguments[0];
    return gitEngine.fetch(remoteName);
  }
}
