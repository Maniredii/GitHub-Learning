# GitGraph Component

A visual Git repository graph component that displays commit history, branches, and the current HEAD position using gitgraph-js.

## Components

### GitGraph

The base component that renders a Git graph visualization.

**Props:**
- `commits: Commit[]` - Array of commit objects to display
- `branches: Branch[]` - Array of branch objects
- `currentHead: string` - Current HEAD position (branch name or commit hash)
- `onCommitClick?: (commitHash: string) => void` - Optional callback when a commit is clicked

**Features:**
- Visual representation of commit history as a node graph
- Branches displayed as colored lines
- Current HEAD highlighted with special styling
- Empty state when no commits exist
- Error handling with retry functionality
- Game-themed styling matching GitQuest aesthetic

### ConnectedGitGraph

A connected version that fetches repository state from the API.

**Props:**
- `repositoryId: string` - ID of the repository to display
- `onCommitClick?: (commitHash: string) => void` - Optional callback when a commit is clicked
- `refreshTrigger?: number` - Optional trigger to force refresh (increment to refresh)

**Features:**
- Automatic fetching of repository state
- Loading states
- Error handling with retry
- Automatic refresh when repositoryId or refreshTrigger changes

## Usage

### Basic Usage (with data)

```tsx
import { GitGraph } from './components/GitGraph';

function MyComponent() {
  const commits = [
    {
      hash: 'abc123',
      message: 'Initial commit',
      author: 'Player',
      timestamp: new Date(),
      parent: null,
      tree: {},
    },
    {
      hash: 'def456',
      message: 'Add feature',
      author: 'Player',
      timestamp: new Date(),
      parent: 'abc123',
      tree: {},
    },
  ];

  const branches = [
    { name: 'main', commitHash: 'def456' },
  ];

  return (
    <GitGraph
      commits={commits}
      branches={branches}
      currentHead="main"
      onCommitClick={(hash) => console.log('Clicked:', hash)}
    />
  );
}
```

### Connected Usage (fetches from API)

```tsx
import { ConnectedGitGraph } from './components/ConnectedGitGraph';

function QuestView() {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleCommandExecute = () => {
    // Trigger graph refresh after command execution
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div>
      <Terminal
        repositoryId="repo-123"
        onCommandExecute={handleCommandExecute}
      />
      <ConnectedGitGraph
        repositoryId="repo-123"
        refreshTrigger={refreshCounter}
        onCommitClick={(hash) => console.log('Commit:', hash)}
      />
    </div>
  );
}
```

## Styling

The component uses custom CSS with game-themed colors:
- Background: Dark gradient (#1a1a2e to #16213e)
- Primary color: Neon green (#00ff41)
- Accent colors: Cyan, yellow, magenta, red
- Font: Fira Code monospace

## Data Types

```typescript
interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  parent: string | null;
  parents?: string[]; // For merge commits
  tree: any;
}

interface Branch {
  name: string;
  commitHash: string;
}
```

## States

### Empty State
Displayed when there are no commits in the repository.

### Loading State
Displayed while fetching data or rendering the graph.

### Error State
Displayed when an error occurs, with a retry button.

### Normal State
Displays the full Git graph with all commits and branches.

## Customization

The graph uses a custom template based on gitgraph-js Metro template with:
- Custom colors matching the game theme
- Larger commit dots and spacing
- Custom fonts (Fira Code)
- Branch labels with game styling
- HEAD indicator with special highlighting

## Performance

- Commits are sorted chronologically before rendering
- Graph is re-rendered only when props change
- Previous graph is cleared before rendering new one
- Efficient commit lookup using Map data structure

## Accessibility

- Semantic HTML structure
- Color contrast meets WCAG standards
- Keyboard navigation support (via gitgraph-js)
- Screen reader friendly labels

## Browser Support

Requires modern browsers with:
- SVG support
- ES6+ JavaScript
- CSS Grid and Flexbox

## Dependencies

- `@gitgraph/js` - Core graph rendering library
- React 18+
- TypeScript
