# Terminal Component

A game-themed terminal component for GitQuest that provides an interactive command-line interface for executing Git commands.

## Features

- **xterm.js Integration**: Full-featured terminal emulator with cursor support
- **Command History**: Navigate through previous commands using up/down arrow keys
- **Tab Completion**: Auto-complete Git commands by pressing Tab
- **Clear Functionality**: Clear the terminal with Ctrl+L or the `clear` command
- **Game-Themed Styling**: Custom color scheme and visual design matching GitQuest aesthetic
- **Loading States**: Visual feedback during command execution
- **Error Handling**: Game-themed error messages with helpful hints
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Installation

The component requires the following dependencies:

```bash
npm install @xterm/xterm @xterm/addon-fit
```

## Usage

```tsx
import { Terminal } from './components/Terminal';

function QuestView() {
  const handleCommandExecute = (command: string, output: string) => {
    console.log('Command:', command);
    console.log('Output:', output);
  };

  return (
    <Terminal
      repositoryId="my-repo-123"
      onCommandExecute={handleCommandExecute}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `repositoryId` | `string` | Yes | Unique identifier for the Git repository |
| `onCommandExecute` | `(command: string, output: string) => void` | No | Callback fired when a command is executed |
| `onClear` | `() => void` | No | Callback fired when terminal is cleared |

## Keyboard Shortcuts

- **Enter**: Execute command
- **Backspace**: Delete character
- **Ctrl+C**: Cancel current input
- **Ctrl+L**: Clear terminal
- **Up Arrow**: Previous command in history
- **Down Arrow**: Next command in history
- **Tab**: Auto-complete Git commands

## Supported Commands

The terminal supports all Git commands through the backend API:

- `git init`
- `git add <file>`
- `git commit -m "<message>"`
- `git status`
- `git log`
- `git branch [name]`
- `git checkout <branch>`
- `git merge <branch>`
- `git push <remote> <branch>`
- `git pull <remote> <branch>`
- `git clone <url>`
- `git remote add <name> <url>`
- `git reset [options]`
- `git fetch`
- `git diff`
- `clear` (built-in command to clear terminal)

## Styling

The component uses custom CSS with a game theme. The main colors are:

- Background: `#1a1a2e` (dark blue-black)
- Foreground: `#eee` (light gray)
- Cursor: `#00ff41` (matrix green)
- Prompt: Green `$` symbol
- Errors: Red with `✗` symbol
- Success: Standard terminal colors
- Hints: Yellow with `💡` symbol

## Testing

Tests are written using Vitest and React Testing Library:

```bash
npm test
```

## API Integration

The terminal communicates with the backend through the `gitApi` service:

```typescript
// Execute a Git command
const response = await gitApi.executeCommand(repositoryId, command);

// Response format
{
  output: string;      // Command output
  newState: any;       // Updated repository state
  error?: string;      // Error message if command failed
}
```

## Error Handling

The terminal provides game-themed error messages:

- **Command errors**: "✗ Your spell fizzled!" with the error details
- **Network errors**: "✗ Connection to the Chrono-Realm failed!"
- **Helpful hints**: Suggestions for common mistakes

## Accessibility

- Keyboard navigation fully supported
- Screen reader compatible (terminal content is accessible)
- High contrast color scheme
- Responsive design for mobile devices

## Future Enhancements

- Command suggestions based on context
- Syntax highlighting for command output
- Multi-line command support
- Copy/paste functionality
- Search through command history
- Custom themes
