# Boss Battle API Documentation

## Overview

The Boss Battle API provides endpoints for retrieving boss battle scenarios and validating their completion. Boss battles are special challenges that test mastery of multiple Git concepts.

## Endpoints

### 1. Get All Boss Battles

**Endpoint:** `GET /api/boss-battles`

**Description:** Retrieve a list of all boss battles.

**Authentication:** Not required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "The Corrupted Timeline",
      "description": "A temporal anomaly has corrupted the project timeline...",
      "chapterId": "uuid",
      "bonusXp": 500,
      "order": 1
    }
  ]
}
```

### 2. Get Boss Battle by ID

**Endpoint:** `GET /api/boss-battles/:id`

**Description:** Get detailed information about a specific boss battle, including its initial repository state.

**Authentication:** Not required

**Parameters:**

- `id` (path parameter): Boss battle UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "battle": {
      "id": "uuid",
      "name": "The Corrupted Timeline",
      "description": "A temporal anomaly has corrupted the project timeline...",
      "narrative": "The archives tremble as you approach...",
      "bonusXp": 500
    },
    "initialState": {
      "id": "boss-battle-1-repo",
      "workingDirectory": { ... },
      "stagingArea": { ... },
      "commits": [ ... ],
      "branches": [ ... ],
      "head": "main",
      "remotes": []
    }
  }
}
```

### 3. Validate Boss Battle

**Endpoint:** `POST /api/boss-battles/:id/validate`

**Description:** Validate if the player has successfully completed the boss battle.

**Authentication:** Not required (but typically used with authenticated users)

**Parameters:**

- `id` (path parameter): Boss battle UUID

**Request Body:**

```json
{
  "repositoryState": {
    "id": "boss-battle-1-repo",
    "workingDirectory": { ... },
    "stagingArea": { ... },
    "commits": [ ... ],
    "branches": [ ... ],
    "head": "main",
    "remotes": []
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "feedback": "Victory! You have successfully completed the boss battle!",
  "bonusXp": 500,
  "details": {
    "restoredCommit": "abc123"
  }
}
```

**Failure Response:**

```json
{
  "success": false,
  "feedback": "The corruption persists! You are currently at commit ghi789...",
  "bonusXp": 0,
  "details": {
    "issue": "wrong_commit",
    "currentCommit": "ghi789",
    "requiredCommits": ["abc123", "def456"]
  }
}
```

## Boss Battle Types

### The Corrupted Timeline

**Objective:** Restore the repository to a commit before corruption occurred.

**Victory Conditions:**

- Repository HEAD must point to one of the "good" commits (before corruption)
- Working directory must match the restored commit's tree

**Common Failure Reasons:**

- `wrong_commit`: Not on a required commit
- `working_directory_mismatch`: Files don't match the commit state
- `no_valid_branch`: Not on a valid branch

### The Convergence Conflict

**Objective:** Merge two branches and resolve the resulting conflict.

**Victory Conditions:**

- Must be on the main branch
- Current commit must be a merge commit (two parents)
- Conflict markers must be removed from the specified file
- No uncommitted changes in staging area

**Common Failure Reasons:**

- `wrong_branch`: Not on the required branch
- `no_merge_commit`: Merge has not been performed
- `conflict_markers_present`: Conflict markers still exist in file
- `uncommitted_changes`: Merge not finalized with commit

## Error Codes

- `BOSS_BATTLE_NOT_FOUND`: Boss battle with specified ID does not exist
- `MISSING_REPOSITORY_STATE`: Request body missing required repositoryState
- `FETCH_BOSS_BATTLE_ERROR`: Server error while fetching boss battle
- `VALIDATION_ERROR`: Server error during validation

## Usage Example

```javascript
// Fetch boss battle
const response = await fetch('/api/boss-battles/uuid');
const { data } = await response.json();

// Initialize repository with initial state
const repository = new GitRepository(data.initialState);

// Player executes commands...
repository.execute('git log');
repository.execute('git reset --hard abc123');

// Validate completion
const validationResponse = await fetch('/api/boss-battles/uuid/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryState: repository.getState(),
  }),
});

const result = await validationResponse.json();
if (result.success) {
  console.log('Boss defeated!', result.bonusXp, 'XP earned');
}
```
