# Achievement API Documentation

## Overview

The Achievement API provides endpoints for checking, awarding, and retrieving achievements earned by users as they progress through GitQuest.

## Endpoints

### 1. Check and Award Achievements

**Endpoint:** `POST /api/achievements/check`

**Authentication:** Required (JWT token)

**Description:** Evaluates user actions and awards achievements if conditions are met. Prevents duplicate achievements.

**Request Body:**

```json
{
  "action": "commit" | "merge" | "conflict_resolution" | "pull_request" | "rebase",
  "context": {
    // Optional additional context about the action
  }
}
```

**Response (200 OK):**

```json
{
  "newAchievements": [
    {
      "id": "uuid",
      "name": "First Blood",
      "description": "Create your first commit and seal your first moment in time",
      "badge_icon": "🩸",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Congratulations! You've earned the \"First Blood\" achievement!"
}
```

**Response (200 OK - No new achievements):**

```json
{
  "newAchievements": []
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `400 Bad Request` - Invalid action type
- `500 Internal Server Error` - Server error

---

### 2. Get User's Earned Achievements

**Endpoint:** `GET /api/achievements/user`

**Authentication:** Required (JWT token)

**Description:** Retrieves all achievements earned by the authenticated user, ordered by most recently earned.

**Response (200 OK):**

```json
{
  "earned": [
    {
      "id": "uuid",
      "name": "First Blood",
      "description": "Create your first commit and seal your first moment in time",
      "badge_icon": "🩸",
      "created_at": "2024-01-01T00:00:00.000Z",
      "earnedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Branch Master",
      "description": "Successfully merge your first branch and unite parallel timelines",
      "badge_icon": "🌿",
      "created_at": "2024-01-01T00:00:00.000Z",
      "earnedAt": "2024-01-16T14:20:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

---

### 3. Get All Available Achievements

**Endpoint:** `GET /api/achievements`

**Authentication:** Not required (public endpoint)

**Description:** Retrieves all available achievements in the game, regardless of whether the user has earned them.

**Response (200 OK):**

```json
{
  "achievements": [
    {
      "id": "uuid",
      "name": "Branch Master",
      "description": "Successfully merge your first branch and unite parallel timelines",
      "badge_icon": "🌿",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Collaborator",
      "description": "Submit your first pull request and join the Council of Coders",
      "badge_icon": "🤝",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Conflict Resolver",
      "description": "Resolve your first merge conflict and restore harmony to the codebase",
      "badge_icon": "⚔️",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "First Blood",
      "description": "Create your first commit and seal your first moment in time",
      "badge_icon": "🩸",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Time Lord",
      "description": "Master the art of rebase and rewrite history itself",
      "badge_icon": "⏰",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `500 Internal Server Error` - Server error

---

## Achievement Types

The following action types trigger achievement checks:

| Action Type           | Achievement       | Description                          |
| --------------------- | ----------------- | ------------------------------------ |
| `commit`              | First Blood       | Awarded on first commit              |
| `merge`               | Branch Master     | Awarded on first successful merge    |
| `conflict_resolution` | Conflict Resolver | Awarded on first conflict resolution |
| `pull_request`        | Collaborator      | Awarded on first pull request        |
| `rebase`              | Time Lord         | Awarded on first rebase operation    |

---

## Usage Examples

### Check for Achievement After Commit

```javascript
// After user executes a commit command
const response = await fetch('/api/achievements/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    action: 'commit',
    context: {
      commitHash: 'abc123',
      message: 'Initial commit',
    },
  }),
});

const result = await response.json();
if (result.newAchievements.length > 0) {
  // Display achievement notification
  console.log(result.message);
}
```

### Get User's Achievements for Profile Display

```javascript
const response = await fetch('/api/achievements/user', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const { earned } = await response.json();
// Display earned achievements in user profile
```

### Get All Achievements for Achievement Gallery

```javascript
const response = await fetch('/api/achievements');
const { achievements } = await response.json();
// Display all achievements with locked/unlocked states
```

---

## Integration Notes

1. **Automatic Checking**: The achievement check endpoint should be called after relevant Git operations (commit, merge, etc.)
2. **Duplicate Prevention**: The system automatically prevents awarding the same achievement twice to a user
3. **Real-time Notifications**: When `newAchievements` is not empty, display a celebration notification to the user
4. **Badge Display**: Use the `badge_icon` field (emoji) for visual representation in the UI
5. **Progress Tracking**: Combine with the Progress API to show overall user advancement
