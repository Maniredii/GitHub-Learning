# Progress API Documentation

This document describes the Progress API endpoints for the GitQuest application.

## Base URL

All endpoints are prefixed with `/api/progress`

## Authentication

All progress endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get User Progress

Get the current user's progress statistics including XP, level, rank, and completed quests.

**Endpoint:** `GET /api/progress`

**Authentication:** Required

**Request:**

```http
GET /api/progress HTTP/1.1
Authorization: Bearer <token>
```

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "xp": 350,
    "level": 3,
    "rank": "Journeyman Archivist",
    "currentChapter": "chapter-2",
    "currentQuest": "quest-2-3",
    "completedQuests": ["quest-1-1", "quest-1-2", "quest-2-1", "quest-2-2", "quest-2-3"],
    "xpToNextLevel": 450,
    "totalQuestsCompleted": 5
  }
}
```

**Response Fields:**

- `xp` (number): Total experience points earned
- `level` (number): Current level (1-20)
- `rank` (string): Current rank title based on level
- `currentChapter` (string | null): ID of the current chapter
- `currentQuest` (string | null): ID of the most recently completed quest
- `completedQuests` (string[]): Array of completed quest IDs
- `xpToNextLevel` (number | null): XP required to reach next level (null if max level)
- `totalQuestsCompleted` (number): Total number of quests completed

**Response (Error - 401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Response (Error - 500 Internal Server Error):**

```json
{
  "success": false,
  "error": {
    "code": "FETCH_PROGRESS_ERROR",
    "message": "Failed to fetch user progress"
  }
}
```

---

### 2. Complete Quest

Mark a quest as completed and award XP to the user. This endpoint should be called after successfully validating a quest.

**Endpoint:** `POST /api/progress/complete-quest`

**Authentication:** Required

**Request:**

```http
POST /api/progress/complete-quest HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "questId": "quest-1-1"
}
```

**Request Body:**

- `questId` (string, required): The ID of the quest to mark as completed

**Response (Success - 200 OK):**

```json
{
  "success": true,
  "data": {
    "newXp": 150,
    "newLevel": 2,
    "leveledUp": true,
    "unlockedQuests": ["quest-1-2"],
    "xpEarned": 50,
    "newRank": "Apprentice Coder"
  },
  "message": "Quest completed! You've leveled up to level 2!"
}
```

**Response Fields:**

- `newXp` (number): Total XP after completing the quest
- `newLevel` (number): Current level after completing the quest
- `leveledUp` (boolean): Whether the user leveled up
- `unlockedQuests` (string[]): Array of newly unlocked quest IDs
- `xpEarned` (number): XP earned from this quest
- `newRank` (string, optional): New rank title (only present if leveled up)

**Response (Success without Level Up - 200 OK):**

```json
{
  "success": true,
  "data": {
    "newXp": 75,
    "newLevel": 1,
    "leveledUp": false,
    "unlockedQuests": ["quest-1-2"],
    "xpEarned": 25
  },
  "message": "Quest completed! You earned 25 XP."
}
```

**Response (Error - 400 Bad Request - Missing Quest ID):**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_QUEST_ID",
    "message": "Quest ID is required"
  }
}
```

**Response (Error - 400 Bad Request - Already Completed):**

```json
{
  "success": false,
  "error": {
    "code": "QUEST_ALREADY_COMPLETED",
    "message": "Quest has already been completed"
  }
}
```

**Response (Error - 404 Not Found):**

```json
{
  "success": false,
  "error": {
    "code": "QUEST_NOT_FOUND",
    "message": "Quest not found"
  }
}
```

**Response (Error - 401 Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Response (Error - 500 Internal Server Error):**

```json
{
  "success": false,
  "error": {
    "code": "COMPLETE_QUEST_ERROR",
    "message": "Failed to complete quest"
  }
}
```

---

## Level and Rank System

### XP Thresholds

| Level | XP Required | Rank                      |
| ----- | ----------- | ------------------------- |
| 1     | 0           | Apprentice Coder          |
| 2     | 100         | Apprentice Coder          |
| 3     | 250         | Journeyman Archivist      |
| 4     | 450         | Journeyman Archivist      |
| 5     | 700         | Journeyman Archivist      |
| 6     | 1,000       | Skilled Chrono-Coder      |
| 7     | 1,350       | Skilled Chrono-Coder      |
| 8     | 1,750       | Skilled Chrono-Coder      |
| 9     | 2,200       | Skilled Chrono-Coder      |
| 10    | 2,700       | Master Time-Weaver        |
| 11    | 3,250       | Master Time-Weaver        |
| 12    | 3,850       | Master Time-Weaver        |
| 13    | 4,500       | Master Time-Weaver        |
| 14    | 5,200       | Master Time-Weaver        |
| 15    | 5,950       | Legendary Git Guardian    |
| 16    | 6,750       | Legendary Git Guardian    |
| 17    | 7,600       | Legendary Git Guardian    |
| 18    | 8,500       | Legendary Git Guardian    |
| 19    | 9,450       | Legendary Git Guardian    |
| 20    | 10,450      | Eternal Repository Keeper |

### Rank Progression

- **Apprentice Coder** (Levels 1-2): Just starting the journey
- **Journeyman Archivist** (Levels 3-5): Learning the basics
- **Skilled Chrono-Coder** (Levels 6-9): Mastering core concepts
- **Master Time-Weaver** (Levels 10-14): Advanced Git techniques
- **Legendary Git Guardian** (Levels 15-19): Expert-level mastery
- **Eternal Repository Keeper** (Level 20+): Ultimate achievement

---

## Usage Flow

### Typical Quest Completion Flow

1. User starts a quest (GET `/api/quests/:id`)
2. User executes Git commands (POST `/api/git/execute`)
3. User validates quest completion (POST `/api/quests/:id/validate`)
4. If validation succeeds, complete the quest (POST `/api/progress/complete-quest`)
5. Display XP earned and level-up notification to user
6. Unlock next quest in sequence

### Example Integration

```javascript
// After successful quest validation
const validateResponse = await fetch('/api/quests/quest-1-1/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ repositoryState }),
});

const validation = await validateResponse.json();

if (validation.success) {
  // Complete the quest and award XP
  const completeResponse = await fetch('/api/progress/complete-quest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questId: 'quest-1-1' }),
  });

  const result = await completeResponse.json();

  if (result.data.leveledUp) {
    console.log(`Level up! You are now level ${result.data.newLevel}`);
    console.log(`New rank: ${result.data.newRank}`);
  }

  console.log(`XP earned: ${result.data.xpEarned}`);
  console.log(`Total XP: ${result.data.newXp}`);
  console.log(`Unlocked quests: ${result.data.unlockedQuests.join(', ')}`);
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:

- `UNAUTHORIZED`: Missing or invalid authentication token
- `MISSING_QUEST_ID`: Required quest ID not provided
- `QUEST_NOT_FOUND`: Quest with given ID does not exist
- `QUEST_ALREADY_COMPLETED`: User has already completed this quest
- `FETCH_PROGRESS_ERROR`: Failed to retrieve user progress
- `COMPLETE_QUEST_ERROR`: Failed to complete quest

---

## Notes

- Quest completion is idempotent - attempting to complete the same quest twice will return an error
- XP is awarded based on the quest's `xp_reward` field
- Level-ups are calculated automatically based on total XP
- Quests are unlocked sequentially within each chapter
- The system supports up to level 20, with no XP cap
