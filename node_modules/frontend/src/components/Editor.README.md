# Editor Component

A Monaco Editor-based code editor component for GitQuest that supports file editing, syntax highlighting, and conflict resolution.

## Features

- **Monaco Editor Integration**: Full-featured code editor with IntelliSense
- **Syntax Highlighting**: Automatic language detection based on file extension
- **Save Functionality**: Keyboard shortcut (Ctrl+S / Cmd+S) and button support
- **Conflict Resolution**: Special UI for resolving merge conflicts
- **Read-Only Mode**: Display files without allowing edits
- **Unsaved Changes Indicator**: Visual feedback for modified content

## Usage

### Basic Editor

```tsx
import { Editor } from './components';

function MyComponent() {
  const [content, setContent] = useState('console.log("Hello");');

  const handleSave = (newContent: string) => {
    // Save to backend
    setContent(newContent);
  };

  return (
    <Editor
      filePath="src/app.js"
      content={content}
      onSave={handleSave}
    />
  );
}
```

### Conflict Resolution Mode

```tsx
<Editor
  filePath="src/feature.js"
  content={conflictContent}
  conflictMode={true}
  onAcceptCurrent={() => {
    // Accept current branch changes
  }}
  onAcceptIncoming={() => {
    // Accept incoming branch changes
  }}
  onSave={handleSave}
/>
```

### Read-Only Mode

```tsx
<Editor
  filePath="README.md"
  content={readmeContent}
  readOnly={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `filePath` | `string` | Yes | - | Path of the file being edited |
| `content` | `string` | Yes | - | Initial content of the file |
| `language` | `string` | No | `'javascript'` | Programming language for syntax highlighting |
| `onSave` | `(content: string) => void` | No | - | Callback when content is saved |
| `readOnly` | `boolean` | No | `false` | Whether the editor is read-only |
| `conflictMode` | `boolean` | No | `false` | Enable conflict resolution UI |
| `onAcceptCurrent` | `() => void` | No | - | Callback for accepting current changes |
| `onAcceptIncoming` | `() => void` | No | - | Callback for accepting incoming changes |

## Supported Languages

The editor automatically detects language based on file extension:

- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`
- Python: `.py`
- Markdown: `.md`
- JSON: `.json`
- HTML: `.html`
- CSS: `.css`
- Plain text: `.txt`

## Keyboard Shortcuts

- **Ctrl+S / Cmd+S**: Save file
- **Ctrl+Z / Cmd+Z**: Undo
- **Ctrl+Y / Cmd+Y**: Redo
- **Ctrl+F / Cmd+F**: Find
- **Ctrl+H / Cmd+H**: Replace

## Styling

The editor uses a dark theme by default to match the GitQuest aesthetic. You can customize the appearance by modifying `Editor.css`.

## Integration with Git Engine

The editor is designed to work with the GitQuest Git engine:

1. Load file content from repository state
2. Edit content in the editor
3. Save changes to update working directory
4. Commit changes using the terminal

## Conflict Resolution

When `conflictMode` is enabled, the editor displays special buttons for resolving merge conflicts:

- **Accept Current**: Keep changes from the current branch
- **Accept Incoming**: Keep changes from the incoming branch
- Manual resolution: Edit the file directly to resolve conflicts

The editor highlights conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) for easy identification.

## Performance

- Monaco Editor is lazy-loaded to reduce initial bundle size
- Automatic layout adjustment for responsive design
- Minimap disabled by default for better performance on smaller screens

## Examples

See `Editor.example.tsx` for complete working examples.
