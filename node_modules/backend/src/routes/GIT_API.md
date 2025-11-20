# Git Command Execution API

## Overview

The Git Command Execution API allows clients to execute Git commands against simulated repositories and retrieve repository state.

## Endpoints

### 1. Execute Git Command

**Endpoint:** `POST /api/git/execute`

**Description:** Executes a Git command string against a repository and returns the result along with updated repository state.

**Request Body:**

```json
{
  "repositoryId": "repo_123",
  "command": "git commit -m \"Initial commit\""
}
```

**Parameters:**

- `repositoryId` (string, required): Unique identifier for the repository
- `command` (string, required): Git command to execute (with or without 'git' prefix)

**Success Response (200):**

```json
{
  "success": true,
  "output": "[main abc1234] Initial commit\n 1 file(s) changed",
  "message": "Commit created successfully",
  "error": null,
  "state": {
    "workingDirectory": {},
    "stagingArea": {},
    "commits": [...],
    "branches": [...],
    "head": "main",
    "remotes": []
  }
}
```

**Error Response (400/500):**

```json
{
  "error": {
    "code": "INVALID_COMMAND",
    "message": "Command must be a non-empty string"
  }
}
```

---

### 2. Get Repository State

**Endpoint:** `GET /api/git/repository/:id`

**Description:** Retrieves the current state of a repository.

**Success Response (200):**

```json
{
  "state": {
    "workingDirectory": {},
    "stagingArea": {},
    "commits": [],
    "branches": [{ "name": "main", "commitHash": "" }],
    "head": "main",
    "remotes": []
  }
}
```

---

### 3. Create Repository

**Endpoint:** `POST /api/git/repository/create`

**Description:** Creates a new repository with optional initial files.

**Request Body:**

```json
{
  "initialFiles": {
    "README.md": {
      "content": "# My Project",
      "modified": true
    }
  }
}
```

**Success Response (201):**

```json
{
  "repositoryId": "repo_1234567890_abc123",
  "state": {
    "workingDirectory": {...},
    "stagingArea": {},
    "commits": [],
    "branches": [{"name": "main", "commitHash": ""}],
    "head": "main",
    "remotes": []
  }
}
```

---

### 4. Update Repository State

**Endpoint:** `PUT /api/git/repository/:id`

**Description:** Updates a repository's state (useful for restoring from database).

**Request Body:**

```json
{
  "state": {
    "workingDirectory": {},
    "stagingArea": {},
    "commits": [],
    "branches": [],
    "head": "main",
    "remotes": []
  }
}
```

**Success Response (200):**

```json
{
  "message": "Repository updated successfully",
  "state": {...}
}
```

---

### 5. Delete Repository

**Endpoint:** `DELETE /api/git/repository/:id`

**Description:** Deletes a repository from memory.

**Success Response (200):**

```json
{
  "message": "Repository deleted successfully"
}
```

---

## Supported Git Commands

The command parser supports the following Git commands:

### Basic Commands

- `git add <file>` - Stage a specific file
- `git add .` - Stage all files
- `git commit -m "message"` - Create a commit
- `git status` - Show repository status
- `git log` - Show commit history
- `git log --oneline` - Show condensed commit history

### Branch Commands

- `git branch` - List branches
- `git branch <name>` - Create a new branch
- `git checkout <branch>` - Switch to a branch
- `git checkout -b <name>` - Create and switch to a new branch
- `git checkout -- <file>` - Discard changes to a file

### Merge and Reset

- `git merge <branch>` - Merge a branch
- `git reset HEAD <file>` - Unstage a file
- `git reset --hard <commit>` - Reset to a specific commit

### Remote Commands

- `git remote` - List remotes
- `git remote -v` - List remotes with URLs
- `git remote add <name> <url>` - Add a remote
- `git clone <url>` - Clone a repository
- `git push <remote> <branch>` - Push to remote
- `git pull <remote> <branch>` - Pull from remote
- `git fetch <remote>` - Fetch from remote

---

## Command Parsing Features

### Flexible Input

- Commands can be provided with or without the `git` prefix
- Example: Both `"git status"` and `"status"` work

### Quote Handling

- Commit messages with spaces are properly parsed
- Example: `git commit -m "This is a message with spaces"`

### Flag Support

- Short flags: `-m`, `-b`, `--hard`
- Long flags: `--oneline`, `--hard`
- Flags with values: `-m "message"` or `--mode=hard`

### Error Messages with Hints

When a command fails, the API provides helpful error messages:

```json
{
  "success": false,
  "message": "'comit' is not a git command. Did you mean 'git commit'?",
  "error": "Invalid command"
}
```

---

## Example Usage

### Execute a series of Git commands

```javascript
// Create a repository
const createResponse = await fetch('/api/git/repository/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    initialFiles: {
      'index.html': { content: '<h1>Hello</h1>', modified: true },
    },
  }),
});
const { repositoryId } = await createResponse.json();

// Add files
await fetch('/api/git/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryId,
    command: 'git add .',
  }),
});

// Commit
await fetch('/api/git/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryId,
    command: 'git commit -m "Initial commit"',
  }),
});

// Check status
const statusResponse = await fetch('/api/git/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryId,
    command: 'git status',
  }),
});
const result = await statusResponse.json();
console.log(result.output);
```

---

## Error Codes

| Code                    | Description                                  |
| ----------------------- | -------------------------------------------- |
| `MISSING_REPOSITORY_ID` | Repository ID was not provided               |
| `INVALID_COMMAND`       | Command is not a valid string                |
| `REPOSITORY_NOT_FOUND`  | Repository with given ID does not exist      |
| `MISSING_STATE`         | Repository state was not provided for update |
| `INTERNAL_ERROR`        | An unexpected error occurred                 |

---

## Notes

- Repositories are stored in memory and will be lost on server restart
- In production, repository states should be persisted to a database
- The API is designed for educational purposes and simulates Git behavior
- Some advanced Git features may not be fully implemented
