# Quest and Chapter API Documentation

This document describes the Quest Content Management System API endpoints.

## Overview

The Quest Content Management System provides endpoints for managing and validating quests and chapters in the GitQuest game. It includes quest retrieval, chapter management, and quest validation functionality.

## Endpoints

### Quest Endpoints

#### GET /api/quests

List all quests with optional filtering.

**Query Parameters:**

- `chapter` (optional): Filter quests by chapter ID
- `unlocked` (optional): Filter by unlock status (requires authentication)

**Authentication:** Optional (required for `unlocked` filter)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "chapter_id": "uuid",
      "title": "Quest Title",
      "narrative": "Quest story...",
      "objective": "Learning objective",
      "hints": ["hint1", "hint2"],
      "xp_reward": 100,
      "order": 1,
      "validation_criteria": {
        "type": "commit_exists",
        "parameters": { "minimumCommits": 1 }
      },
      "initial_repository_state": { ... }
    }
  ]
}
```

#### GET /api/quests/:id

Get a specific quest by ID.

**Parameters:**

- `id`: Quest UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "chapter_id": "uuid",
    "title": "Quest Title",
    "narrative": "Quest story...",
    "objective": "Learning objective",
    "hints": ["hint1", "hint2"],
    "xp_reward": 100,
    "order": 1,
    "validation_criteria": { ... },
    "initial_repository_state": { ... }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "code": "QUEST_NOT_FOUND",
    "message": "Quest not found"
  }
}
```

#### POST /api/quests/:id/validate

Validate if a quest's objectives are met based on repository state.

**Parameters:**

- `id`: Quest UUID

**Request Body:**

```json
{
  "repositoryState": {
    "id": "repo-id",
    "workingDirectory": { ... },
    "stagingArea": { ... },
    "commits": [ ... ],
    "branches": [ ... ],
    "head": "main",
    "remotes": [ ... ]
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "feedback": "Great work! Your commits look perfect.",
  "xpAwarded": 100,
  "details": { ... }
}
```

**Response (Failure):**

```json
{
  "success": false,
  "feedback": "You need at least 2 commits. You currently have 1.",
  "xpAwarded": 0,
  "details": {
    "expected": 2,
    "actual": 1
  }
}
```

### Chapter Endpoints

#### GET /api/chapters

List all chapters ordered by their sequence.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Chapter Title",
      "description": "Chapter description",
      "theme_region": "The Ancient Library",
      "order": 1,
      "is_premium": false,
      "unlock_requirements": {
        "previousChapter": "uuid",
        "minimumLevel": 5
      }
    }
  ]
}
```

#### GET /api/chapters/:id/quests

Get all quests for a specific chapter.

**Parameters:**

- `id`: Chapter UUID

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "chapter_id": "uuid",
      "title": "Quest Title",
      "narrative": "Quest story...",
      "objective": "Learning objective",
      "hints": ["hint1", "hint2"],
      "xp_reward": 100,
      "order": 1,
      "validation_criteria": { ... }
    }
  ]
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": {
    "code": "CHAPTER_NOT_FOUND",
    "message": "Chapter not found"
  }
}
```

## Validation Criteria Types

The quest validation system supports multiple validation types:

### 1. commit_exists

Validates that commits exist in the repository.

**Parameters:**

- `minimumCommits` (number): Minimum number of commits required
- `commitMessage` (string): Specific commit message to look for
- `commitHash` (string): Specific commit hash to verify

**Example:**

```json
{
  "type": "commit_exists",
  "parameters": {
    "minimumCommits": 2,
    "commitMessage": "Initial commit"
  }
}
```

### 2. branch_exists

Validates that branches exist in the repository.

**Parameters:**

- `branchName` (string): Specific branch name to look for
- `minimumBranches` (number): Minimum number of branches required

**Example:**

```json
{
  "type": "branch_exists",
  "parameters": {
    "branchName": "feature",
    "minimumBranches": 2
  }
}
```

### 3. file_content

Validates file content in the repository.

**Parameters:**

- `filePath` (string): Path to the file
- `fileExists` (boolean): Whether the file should exist
- `expectedContent` (string): Exact content expected
- `containsText` (string): Text that should be present in the file

**Example:**

```json
{
  "type": "file_content",
  "parameters": {
    "filePath": "README.md",
    "containsText": "# My Project"
  }
}
```

### 4. merge_completed

Validates that a merge has been completed.

**Parameters:**

- `sourceBranch` (string): Source branch name
- `targetBranch` (string): Target branch name
- `noConflicts` (boolean): Whether conflicts should be resolved

**Example:**

```json
{
  "type": "merge_completed",
  "parameters": {
    "noConflicts": true
  }
}
```

### 5. custom

Custom validation logic for special cases.

**Parameters:**

- `requiresManualCompletion` (boolean): Always passes (for tutorial quests)
- `checkRepositoryInitialized` (boolean): Verify repository is initialized
- `checkStagingArea` (boolean): Verify staging area has files
- `minimumFiles` (number): Minimum files in staging area

**Example:**

```json
{
  "type": "custom",
  "parameters": {
    "checkStagingArea": true,
    "minimumFiles": 1
  }
}
```

## Database Schema

### chapters table

- `id` (UUID): Primary key
- `title` (VARCHAR): Chapter title
- `description` (TEXT): Chapter description
- `theme_region` (VARCHAR): Visual theme region name
- `order` (INTEGER): Sequential order
- `is_premium` (BOOLEAN): Premium content flag
- `unlock_requirements` (JSONB): Unlock conditions
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

### quests table

- `id` (UUID): Primary key
- `chapter_id` (UUID): Foreign key to chapters
- `title` (VARCHAR): Quest title
- `narrative` (TEXT): Quest story/narrative
- `objective` (TEXT): Learning objective
- `hints` (JSONB): Array of hint strings
- `xp_reward` (INTEGER): XP awarded on completion
- `order` (INTEGER): Order within chapter
- `validation_criteria` (JSONB): Validation rules
- `initial_repository_state` (JSONB): Starting repository state
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

## Seeded Content

The system includes seeded content for:

- **Prologue: The Lost Archives** (2 quests)
- **Chapter 1: The Art of Chrono-Coding** (3 quests)
- Additional chapters (5-8) for premium content

## Error Codes

- `FETCH_QUESTS_ERROR`: Failed to retrieve quests
- `QUEST_NOT_FOUND`: Quest ID not found
- `FETCH_CHAPTERS_ERROR`: Failed to retrieve chapters
- `CHAPTER_NOT_FOUND`: Chapter ID not found
- `FETCH_CHAPTER_QUESTS_ERROR`: Failed to retrieve chapter quests
- `MISSING_REPOSITORY_STATE`: Repository state not provided for validation
- `VALIDATION_ERROR`: Quest validation failed

## Usage Examples

### Retrieve all quests for a chapter

```bash
curl http://localhost:3000/api/chapters/{chapter-id}/quests
```

### Validate a quest

```bash
curl -X POST http://localhost:3000/api/quests/{quest-id}/validate \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryState": {
      "id": "test-repo",
      "workingDirectory": {},
      "stagingArea": {},
      "commits": [...],
      "branches": [...],
      "head": "main",
      "remotes": []
    }
  }'
```

### Get unlocked quests for authenticated user

```bash
curl http://localhost:3000/api/quests?unlocked=true \
  -H "Authorization: Bearer {jwt-token}"
```
