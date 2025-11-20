# Editor Component Integration Guide

This guide shows how to integrate the Editor component with the GitQuest Git engine for a complete code editing experience.

## Components Overview

### 1. Editor Component
Basic Monaco Editor wrapper with syntax highlighting and save functionality.

### 2. ConnectedEditor Component
Editor connected to the Git API that automatically loads and saves files.

### 3. Conflict Resolution
Built-in UI for resolving Git merge conflicts.

## Basic Integration

### Using ConnectedEditor (Recommended)

The ConnectedEditor automatically handles loading and saving files from the Git repository:

```tsx
import { ConnectedEditor } from './components';

function QuestEditor() {
  const [repositoryId, setRepositoryId] = useState('repo_123');
  const [currentFile, setCurrentFile] = useState('src/app.js');

  return (
    <div style={{ height: '600px' }}>
      <ConnectedEditor
        repositoryId={repositoryId}
        filePath={currentFile}
        onSaveSuccess={(path, content) => {
          console.log(`Saved ${path}`);
          // Optionally refresh terminal or show notification
        }}
        onSaveError={(error) => {
          console.error('Save failed:', error);
        }}
      />
    </div>
  );
}
```

### Using Basic Editor

For more control, use the basic Editor component:

```tsx
import { Editor } from './components';
import { gitApi } from './services/gitApi';

function CustomEditor() {
  const [content, setContent] = useState('');
  const [repositoryId] = useState('repo_123');
  const [filePath] = useState('src/app.js');

  useEffect(() => {
    // Load file content
    gitApi.getFileContent(repositoryId, filePath)
      .then(file => setContent(file.content))
      .catch(console.error);
  }, [repositoryId, filePath]);

  const handleSave = async (newContent: string) => {
    try {
      await gitApi.updateFileContent(repositoryId, filePath, newContent);
      setContent(newContent);
      console.log('File saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <Editor
      filePath={filePath}
      content={content}
      onSave={handleSave}
    />
  );
}
```

## Conflict Resolution Integration

### Detecting Conflicts

When a merge creates conflicts, the file content will contain conflict markers:

```javascript
function example() {
<<<<<<< HEAD
  return "current version";
=======
  return "incoming version";
>>>>>>> feature-branch
}
```

### Using Conflict Mode

Enable conflict mode to show resolution UI:

```tsx
import { ConnectedEditor } from './components';
import { hasConflictMarkers } from './utils/conflictResolver';

function ConflictEditor() {
  const [repositoryId] = useState('repo_123');
  const [filePath] = useState('src/app.js');
  const [hasConflicts, setHasConflicts] = useState(false);

  // Check for conflicts after merge
  useEffect(() => {
    gitApi.getFileContent(repositoryId, filePath)
      .then(file => {
        setHasConflicts(hasConflictMarkers(file.content));
      });
  }, [repositoryId, filePath]);

  return (
    <ConnectedEditor
      repositoryId={repositoryId}
      filePath={filePath}
      conflictMode={hasConflicts}
      onSaveSuccess={() => {
        setHasConflicts(false);
        console.log('Conflicts resolved and saved');
      }}
    />
  );
}
```

## Complete Quest Integration

### File Browser + Editor + Terminal

```tsx
import { useState } from 'react';
import { ConnectedEditor, Terminal } from './components';
import { gitApi } from './services/gitApi';

function QuestWorkspace() {
  const [repositoryId, setRepositoryId] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);

  // Initialize repository
  useEffect(() => {
    gitApi.createRepository({
      'README.md': { content: '# Quest', modified: true },
      'src/app.js': { content: 'console.log("Start");', modified: true },
    }).then(({ repositoryId, state }) => {
      setRepositoryId(repositoryId);
      setFiles(Object.keys(state.workingDirectory));
      setCurrentFile('README.md');
    });
  }, []);

  const refreshFiles = async () => {
    const { state } = await gitApi.getRepository(repositoryId);
    setFiles(Object.keys(state.workingDirectory));
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* File Browser */}
      <div style={{ width: '200px', borderRight: '1px solid #ccc' }}>
        <h3>Files</h3>
        {files.map(file => (
          <div
            key={file}
            onClick={() => setCurrentFile(file)}
            style={{
              padding: '8px',
              cursor: 'pointer',
              background: file === currentFile ? '#e0e0e0' : 'transparent'
            }}
          >
            {file}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {currentFile && (
            <ConnectedEditor
              repositoryId={repositoryId}
              filePath={currentFile}
              onSaveSuccess={() => {
                console.log('File saved');
                refreshFiles();
              }}
            />
          )}
        </div>

        {/* Terminal */}
        <div style={{ height: '300px', borderTop: '1px solid #ccc' }}>
          <Terminal
            repositoryId={repositoryId}
            onCommandExecuted={refreshFiles}
          />
        </div>
      </div>
    </div>
  );
}
```

## Workflow Examples

### 1. Edit → Stage → Commit

```tsx
// User edits file in editor
// File is automatically saved to working directory
// User runs git commands in terminal:
// $ git add src/app.js
// $ git commit -m "Updated app"
```

### 2. Merge Conflict Resolution

```tsx
// User runs merge command in terminal
// $ git merge feature-branch
// Conflict detected!

// Editor detects conflicts and enables conflict mode
// User clicks "Accept Current" or "Accept Incoming"
// Or manually edits to resolve
// User saves file
// User completes merge in terminal:
// $ git add src/app.js
// $ git commit -m "Resolved conflicts"
```

### 3. Branch Switching

```tsx
// User switches branch in terminal
// $ git checkout feature-branch

// Editor automatically reloads file content
// Shows the version from the new branch
```

## API Reference

### ConnectedEditor Props

| Prop | Type | Description |
|------|------|-------------|
| `repositoryId` | `string` | Repository ID |
| `filePath` | `string` | Path to file |
| `readOnly` | `boolean` | Disable editing |
| `conflictMode` | `boolean` | Enable conflict resolution UI |
| `onSaveSuccess` | `(path, content) => void` | Called after successful save |
| `onSaveError` | `(error) => void` | Called on save error |
| `onLoadError` | `(error) => void` | Called on load error |

### Git API Methods

```typescript
// Load file content
const file = await gitApi.getFileContent(repositoryId, filePath);

// Update file content
await gitApi.updateFileContent(repositoryId, filePath, content);

// Get repository state
const { state } = await gitApi.getRepository(repositoryId);

// Execute git command
const result = await gitApi.executeCommand(repositoryId, 'git status');
```

### Conflict Resolution Utilities

```typescript
import {
  hasConflictMarkers,
  parseConflicts,
  acceptCurrent,
  acceptIncoming,
  validateResolution
} from './utils/conflictResolver';

// Check for conflicts
const hasConflicts = hasConflictMarkers(content);

// Parse conflict regions
const { conflicts } = parseConflicts(content);

// Resolve by accepting current
const resolved = acceptCurrent(content);

// Resolve by accepting incoming
const resolved = acceptIncoming(content);

// Validate resolution
const { isResolved, remainingConflicts } = validateResolution(content);
```

## Best Practices

1. **Always use ConnectedEditor** for quest implementations - it handles loading/saving automatically
2. **Enable conflict mode** when merge conflicts are detected
3. **Validate conflict resolution** before allowing merge completion
4. **Refresh file list** after git operations that modify files
5. **Show loading states** while files are being loaded
6. **Handle errors gracefully** with user-friendly messages
7. **Use keyboard shortcuts** - Ctrl+S for save is built-in

## Troubleshooting

### File not loading
- Check that repositoryId is valid
- Verify file exists in working directory
- Check browser console for API errors

### Save not working
- Ensure file is not in readOnly mode
- Check that content has actually changed
- Verify API endpoint is accessible

### Conflicts not detected
- Ensure conflictMode is enabled
- Check that file content has conflict markers
- Verify conflict resolution utilities are imported

## Performance Tips

1. Monaco Editor is lazy-loaded to reduce bundle size
2. Debounce file saves if implementing auto-save
3. Only load visible files, not entire repository
4. Use React.memo for file list items
5. Implement virtual scrolling for large file lists
