# Git Command Parser & Executor Examples

## Overview

This document provides examples of how the Git command parser and executor work together to process Git commands.

## Command Parsing Examples

### Basic Commands

```typescript
// Input: "git status"
// Parsed:
{
  command: "status",
  arguments: [],
  flags: {},
  raw: "git status"
}

// Input: "git add ."
// Parsed:
{
  command: "add",
  arguments: ["."],
  flags: {},
  raw: "git add ."
}

// Input: "git commit -m "Initial commit""
// Parsed:
{
  command: "commit",
  arguments: [],
  flags: { m: "Initial commit" },
  raw: "git commit -m \"Initial commit\""
}
```

### Commands with Flags

```typescript
// Input: "git log --oneline"
// Parsed:
{
  command: "log",
  arguments: [],
  flags: { oneline: true },
  raw: "git log --oneline"
}

// Input: "git checkout -b feature"
// Parsed:
{
  command: "checkout",
  arguments: ["feature"],
  flags: { b: true },
  raw: "git checkout -b feature"
}

// Input: "git reset --hard HEAD~1"
// Parsed:
{
  command: "reset",
  arguments: ["HEAD~1"],
  flags: { hard: true },
  raw: "git reset --hard HEAD~1"
}
```

### Remote Commands

```typescript
// Input: "git remote add origin https://github.com/user/repo.git"
// Parsed:
{
  command: "remote",
  subcommand: "add",
  arguments: ["origin", "https://github.com/user/repo.git"],
  flags: {},
  raw: "git remote add origin https://github.com/user/repo.git"
}

// Input: "git push origin main"
// Parsed:
{
  command: "push",
  arguments: ["origin", "main"],
  flags: {},
  raw: "git push origin main"
}
```

## Execution Examples

### Scenario 1: Creating First Commit

```typescript
const executor = new CommandExecutor();
const gitEngine = new GitEngine(Repository.create());

// Create a file
gitEngine.createFile('README.md', '# My Project');

// Stage the file
const addResult = executor.execute(gitEngine, 'git add README.md');
// Result: { success: true, message: "Added 'README.md' to staging area" }

// Commit
const commitResult = executor.execute(gitEngine, 'git commit -m "Initial commit"');
// Result: {
//   success: true,
//   output: "[main abc1234] Initial commit\n 1 file(s) changed",
//   message: "Commit created successfully"
// }

// Check status
const statusResult = executor.execute(gitEngine, 'git status');
// Result: {
//   success: true,
//   output: "On branch main\n\nnothing to commit, working tree clean\n"
// }
```

### Scenario 2: Creating and Switching Branches

```typescript
// Create initial commit
gitEngine.createFile('index.html', '<h1>Hello</h1>');
executor.execute(gitEngine, 'git add .');
executor.execute(gitEngine, 'git commit -m "Initial commit"');

// Create and switch to new branch
const checkoutResult = executor.execute(gitEngine, 'git checkout -b feature');
// Result: {
//   success: true,
//   output: "Switched to a new branch 'feature'"
// }

// List branches
const branchResult = executor.execute(gitEngine, 'git branch');
// Result: {
//   success: true,
//   output: "  main\n* feature\n"
// }
```

### Scenario 3: Viewing Commit History

```typescript
// Make multiple commits
gitEngine.createFile('file1.txt', 'content 1');
executor.execute(gitEngine, 'git add .');
executor.execute(gitEngine, 'git commit -m "Add file1"');

gitEngine.createFile('file2.txt', 'content 2');
executor.execute(gitEngine, 'git add .');
executor.execute(gitEngine, 'git commit -m "Add file2"');

// View full log
const logResult = executor.execute(gitEngine, 'git log');
// Result: {
//   success: true,
//   output: "commit abc1234...\nAuthor: Chrono-Coder\nDate: ...\n\n    Add file2\n\ncommit def5678...\n..."
// }

// View condensed log
const onelineResult = executor.execute(gitEngine, 'git log --oneline');
// Result: {
//   success: true,
//   output: "abc1234 Add file2\ndef5678 Add file1\n"
// }
```

## Error Handling Examples

### Invalid Commands

```typescript
// Typo in command
const result1 = executor.execute(gitEngine, 'git comit -m "test"');
// Result: {
//   success: false,
//   message: "'comit' is not a git command. Did you mean 'git commit'?",
//   error: "Invalid command"
// }

// Unknown command
const result2 = executor.execute(gitEngine, 'git xyz');
// Result: {
//   success: false,
//   message: "'xyz' is not a git command. Unknown command. Try 'git status', 'git add', or 'git commit'.",
//   error: "Invalid command"
// }
```

### Missing Arguments

```typescript
// No files specified for add
const result1 = executor.execute(gitEngine, 'git add');
// Result: {
//   success: false,
//   message: "Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?",
//   error: "No files specified"
// }

// No message for commit
const result2 = executor.execute(gitEngine, 'git commit');
// Result: {
//   success: false,
//   message: "Aborting commit due to empty commit message.\nUse 'git commit -m \"message\"' to provide a commit message.",
//   error: "No commit message provided"
// }

// No branch for merge
const result3 = executor.execute(gitEngine, 'git merge');
// Result: {
//   success: false,
//   message: "You must specify which branch to merge.\nUsage: git merge <branch>",
//   error: "No branch specified"
// }
```

### Git Operation Errors

```typescript
// Trying to add non-existent file
const result1 = executor.execute(gitEngine, 'git add nonexistent.txt');
// Result: {
//   success: false,
//   message: "fatal: pathspec 'nonexistent.txt' did not match any files",
//   error: "File 'nonexistent.txt' not found in working directory"
// }

// Trying to commit with nothing staged
const result2 = executor.execute(gitEngine, 'git commit -m "test"');
// Result: {
//   success: false,
//   message: "nothing to commit, working tree clean",
//   error: "No changes staged for commit"
// }

// Trying to checkout non-existent branch
const result3 = executor.execute(gitEngine, 'git checkout nonexistent');
// Result: {
//   success: false,
//   message: "error: pathspec 'nonexistent' did not match any file(s) known to git",
//   error: "Branch or commit 'nonexistent' not found"
// }
```

## Integration with API

### Example API Request

```javascript
// Execute command via API
const response = await fetch('/api/git/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryId: 'repo_123',
    command: 'git commit -m "Initial commit"',
  }),
});

const result = await response.json();
console.log(result);
// {
//   success: true,
//   output: "[main abc1234] Initial commit\n 1 file(s) changed",
//   message: "Commit created successfully",
//   error: null,
//   state: {
//     workingDirectory: {},
//     stagingArea: {},
//     commits: [...],
//     branches: [...],
//     head: "main",
//     remotes: []
//   }
// }
```

## Supported Command Variations

### Add Command

- `git add <file>` - Stage specific file
- `git add .` - Stage all files
- `git add -A` - Stage all files
- `git add --all` - Stage all files

### Commit Command

- `git commit -m "message"` - Commit with message
- `git commit --message "message"` - Commit with message (long form)

### Checkout Command

- `git checkout <branch>` - Switch to branch
- `git checkout -b <branch>` - Create and switch to branch
- `git checkout -- <file>` - Discard changes to file

### Log Command

- `git log` - Full commit history
- `git log --oneline` - Condensed history
- `git log -n 5` - Limit to 5 commits

### Reset Command

- `git reset HEAD <file>` - Unstage file
- `git reset --hard <commit>` - Hard reset to commit

### Remote Command

- `git remote` - List remotes
- `git remote -v` - List remotes with URLs
- `git remote add <name> <url>` - Add remote

## Command Flexibility

The parser is flexible and accepts:

- Commands with or without `git` prefix
- Single or double quotes for strings
- Short flags (`-m`) or long flags (`--message`)
- Various spacing patterns

All of these are equivalent:

```
git commit -m "test"
commit -m "test"
git commit --message "test"
git commit -m 'test'
```
