# ProfileView Component

The `ProfileView` component displays a user's profile with their progress, statistics, and earned achievements.

## Features

- **User Information**: Displays username, rank, and level
- **XP Progress Bar**: Visual representation of experience points progress to next level
- **Statistics Cards**: Shows quests completed, chapters unlocked, and achievements earned
- **Achievement Badges**: Grid display of earned achievements with icons and descriptions
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Error Handling**: Displays error messages with retry functionality
- **Loading States**: Shows loading indicator while fetching data

## Usage

```tsx
import { ProfileView } from './components/ProfileView';

function App() {
  const token = 'user-jwt-token';

  return <ProfileView token={token} onNavigateBack={() => console.log('Navigate back')} />;
}
```

## Props

| Prop             | Type         | Required | Description                                   |
| ---------------- | ------------ | -------- | --------------------------------------------- |
| `token`          | `string`     | Yes      | JWT authentication token for the user         |
| `onNavigateBack` | `() => void` | No       | Callback function when back button is clicked |

## API Integration

The component fetches user profile data from the backend API:

**Endpoint**: `GET /api/users/profile`

**Headers**:

```
Authorization: Bearer <token>
```

**Response**:

```json
{
  "user": {
    "id": "user-id",
    "username": "chrono-coder",
    "email": "user@example.com"
  },
  "progress": {
    "xp": 150,
    "level": 2,
    "rank": "Apprentice Coder",
    "currentChapter": "chapter-1",
    "currentQuest": "quest-1"
  },
  "statistics": {
    "questsCompleted": 5,
    "chaptersUnlocked": 2,
    "achievementsEarned": 3
  },
  "achievements": [
    {
      "id": "achievement-1",
      "name": "First Blood",
      "description": "Made your first commit",
      "badgeIcon": "🎯",
      "earnedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Rank System

The component displays ranks based on user level:

- Level 1-4: **Apprentice Coder**
- Level 5-9: **Journeyman Archivist**
- Level 10-19: **Skilled Chronicler**
- Level 20-29: **Advanced Historian**
- Level 30-39: **Expert Time Weaver**
- Level 40-49: **Legendary Archivist**
- Level 50+: **Master Chrono-Coder**

## XP Calculation

- XP to next level = `(current_level + 1) * 100`
- Progress bar shows XP within current level (0-100)
- Example: At level 2 with 150 XP, progress bar shows 50% (50/100 XP toward level 3)

## Styling

The component uses CSS modules with the following key classes:

- `.profile-view`: Main container
- `.profile-header`: User info section with gradient background
- `.profile-xp-section`: XP progress bar section
- `.profile-statistics`: Statistics cards grid
- `.profile-achievements`: Achievement badges grid

## Responsive Breakpoints

- **Mobile**: < 768px - Single column layout, stacked elements
- **Tablet**: 768px - 1024px - 2-column grid for statistics
- **Desktop**: > 1024px - 3-column grid for statistics

## Error Handling

The component handles the following error scenarios:

1. **Network Errors**: Displays error message with retry button
2. **Authentication Errors**: Shows "User not authenticated" message
3. **Server Errors**: Displays generic error message

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast meets WCAG 2.1 AA standards
- Screen reader friendly

## Testing

Run tests with:

```bash
npm test -- ProfileView.test.tsx --run
```

Test coverage includes:

- Loading state display
- Profile data rendering
- Achievement display
- Empty achievements state
- Error handling
- XP progress calculation
