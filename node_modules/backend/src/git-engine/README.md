# Git Engine

A JavaScript-based Git simulation engine that mimics core Git functionality without requiring actual Git binaries. This engine is designed for the GitQuest educational game.

## Overview

The Git Engine provides a complete simulation of Git's core features including:
- Working directory and staging area management
- Commit creation with proper parent linking
- Commit history and log operations
- File tracking and modification detection

## Architecture

### Core Components

#### Models
- **Blob**: Represents file content with SHA-1 hash
- **Tree**: Represents directory snapshots
- **Commit**: Represents a commit with metadata and tree snapshot
- **Branch**: Represents a branch pointer to a commit
- **Repository**: Main container for all Git state

#### GitEngine
The main class that provides Git command operations:
- `add(filePath)` - Stage a file
- `addAll()` - Stage all files
- `status()` - Show repository status
- `commit(message, author)` - Create a commit
- `log(options)` - Display commit history
- `logOneline()` - Display condensed history

## Usage

### Creating a Repository

```typescript
import { GitEngine, Repository } from './git-engine';

// Create a new repository with initial files
const repo = Repository.create({
  'README.md': { content: '# My Project', modified: false },
  'index.js': { content: 'console.log("Hello");', modified: false }
});

const gitEngine = new GitEngine(repo);
```

### Basic Workflow

```typescript
// Stage files
gitEngine.add('README.md');
// or stage all
gitEngine.addAll();

// Check status
const status = gitEngine.status();
console.log(status.output);

// Create a commit
const result = gitEngine.commit('Initial commit', 'John Doe');
console.log(result.output);

// View history
const log = gitEngine.log();
console.log(log.output);
```

### File Operations

```typescript
// Modify a file
gitEngine.modifyFile('README.md', '# Updated Project');

// Create a new file
gitEngine.createFile('newfile.txt', 'Content');

// Delete a file
gitEngine.deleteFile('oldfile.txt');
```

### Working with Repository State

```typescript
// Get current repository state
const repo = gitEngine.getRepository();

// Serialize to JSON (for storage)
const json = repo.toJSON();

// Restore from JSON
const restoredRepo = Repository.fromJSON(json);
gitEngine.setRepository(restoredRepo);
```

## Implementation Details

### Commit Hash Generation
Commits use SHA-1 hashing (via Node.js crypto) to generate unique identifiers based on:
- Commit message
- Author
- Timestamp
- Tree content
- Parent commit hash

### Status Detection
The status command compares three states:
1. Last commit tree
2. Staging area
3. Working directory

Files are categorized as:
- Staged (in staging area)
- Modified (changed in working directory but not staged)
- Untracked (new files not in last commit)

### Commit History
Commits are linked via parent pointers, forming a directed acyclic graph (DAG). The log operation traverses this graph from HEAD backwards.

## Future Enhancements

The following features will be added in subsequent tasks:
- Branching and merging (Task 5)
- Remote repository simulation (Task 6)
- Reset and checkout operations (Task 5)
- Conflict detection and resolution (Task 5)

## Testing

Run the test suite:
```bash
npm test
```

The test suite covers:
- File staging operations
- Commit creation and linking
- Status output formatting
- Log display in multiple formats
- File modification tracking
