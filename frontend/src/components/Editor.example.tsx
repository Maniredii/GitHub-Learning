import React, { useState } from 'react';
import { Editor } from './Editor';

/**
 * Example usage of the Editor component
 */
export const EditorExample: React.FC = () => {
  const [content, setContent] = useState(`function hello() {
  console.log("Hello, GitQuest!");
}

hello();`);

  const handleSave = (newContent: string) => {
    console.log('Saving content:', newContent);
    setContent(newContent);
    // In a real app, this would call the API to update the file
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <h2>Basic Editor Example</h2>
      <Editor
        filePath="src/example.js"
        content={content}
        language="javascript"
        onSave={handleSave}
      />
    </div>
  );
};

/**
 * Example with conflict resolution mode
 */
export const EditorConflictExample: React.FC = () => {
  const conflictContent = `function greet(name) {
<<<<<<< HEAD
  return "Hello, " + name + "!";
=======
  return \`Hi, \${name}!\`;
>>>>>>> feature-branch
}`;

  const [content, setContent] = useState(conflictContent);

  const handleAcceptCurrent = () => {
    const resolved = `function greet(name) {
  return "Hello, " + name + "!";
}`;
    setContent(resolved);
    console.log('Accepted current changes');
  };

  const handleAcceptIncoming = () => {
    const resolved = `function greet(name) {
  return \`Hi, \${name}!\`;
}`;
    setContent(resolved);
    console.log('Accepted incoming changes');
  };

  const handleSave = (newContent: string) => {
    console.log('Saving resolved content:', newContent);
    setContent(newContent);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <h2>Conflict Resolution Example</h2>
      <Editor
        filePath="src/greet.js"
        content={content}
        language="javascript"
        onSave={handleSave}
        conflictMode={true}
        onAcceptCurrent={handleAcceptCurrent}
        onAcceptIncoming={handleAcceptIncoming}
      />
    </div>
  );
};

/**
 * Example with read-only mode
 */
export const EditorReadOnlyExample: React.FC = () => {
  const content = `# GitQuest README

This is a read-only markdown file.

## Features
- Interactive Git learning
- Gamified experience
- Real-time feedback`;

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <h2>Read-Only Editor Example</h2>
      <Editor
        filePath="README.md"
        content={content}
        language="markdown"
        readOnly={true}
      />
    </div>
  );
};
