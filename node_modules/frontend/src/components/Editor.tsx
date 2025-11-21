import React, { useRef, useState, useEffect } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { hasConflictMarkers, acceptCurrent as resolveAcceptCurrent, acceptIncoming as resolveAcceptIncoming, validateResolution } from '../utils/conflictResolver';
import './Editor.css';

export interface EditorProps {
  filePath: string;
  content: string;
  language?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  conflictMode?: boolean;
  onAcceptCurrent?: () => void;
  onAcceptIncoming?: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  filePath,
  content,
  language = 'javascript',
  onSave,
  readOnly = false,
  conflictMode = false,
  onAcceptCurrent,
  onAcceptIncoming,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [currentContent, setCurrentContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictsResolved, setConflictsResolved] = useState(false);

  // Detect conflicts when content changes
  useEffect(() => {
    const hasMarkers = hasConflictMarkers(currentContent);
    setHasConflicts(hasMarkers);
    
    if (conflictMode && !hasMarkers && hasConflictMarkers(content)) {
      // Conflicts were resolved
      setConflictsResolved(true);
    }
  }, [currentContent, content, conflictMode]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcut for save (Ctrl+S / Cmd+S)
    editor.addCommand(
      // eslint-disable-next-line no-bitwise
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        handleSave();
      }
    );
  };

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    setCurrentContent(newContent);
    setHasUnsavedChanges(newContent !== content);
  };

  const handleSave = () => {
    if (onSave && !readOnly) {
      // Validate conflict resolution if in conflict mode
      if (conflictMode) {
        const validation = validateResolution(currentContent);
        if (!validation.isResolved) {
          alert(`Cannot save: ${validation.remainingConflicts} conflict(s) remaining. Please resolve all conflicts before saving.`);
          return;
        }
      }
      
      onSave(currentContent);
      setHasUnsavedChanges(false);
      setConflictsResolved(false);
    }
  };

  const handleAcceptCurrentChanges = () => {
    const resolved = resolveAcceptCurrent(currentContent);
    setCurrentContent(resolved);
    setHasUnsavedChanges(true);
    
    if (onAcceptCurrent) {
      onAcceptCurrent();
    }
  };

  const handleAcceptIncomingChanges = () => {
    const resolved = resolveAcceptIncoming(currentContent);
    setCurrentContent(resolved);
    setHasUnsavedChanges(true);
    
    if (onAcceptIncoming) {
      onAcceptIncoming();
    }
  };

  const detectLanguage = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      md: 'markdown',
      json: 'json',
      html: 'html',
      css: 'css',
      txt: 'plaintext',
    };
    return languageMap[extension || ''] || language;
  };

  const detectedLanguage = detectLanguage(filePath);

  return (
    <div className="editor-container" role="region" aria-label="Code editor">
      <div className="editor-header">
        <div className="editor-file-info">
          <div className="editor-file-path" id="editor-file-path">{filePath}</div>
          {conflictMode && hasConflicts && (
            <div 
              className="editor-conflict-badge"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">⚠️</span> Conflicts detected
            </div>
          )}
          {conflictMode && conflictsResolved && (
            <div 
              className="editor-resolved-badge"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">✓</span> Conflicts resolved
            </div>
          )}
        </div>
        <div className="editor-actions" role="group" aria-label="Editor actions">
          {conflictMode && hasConflicts && (
            <>
              <button
                className="editor-button editor-button-accept-current"
                onClick={handleAcceptCurrentChanges}
                disabled={readOnly}
                title="Accept all current branch changes"
                aria-label="Accept all current branch changes"
              >
                Accept Current
              </button>
              <button
                className="editor-button editor-button-accept-incoming"
                onClick={handleAcceptIncomingChanges}
                disabled={readOnly}
                title="Accept all incoming branch changes"
                aria-label="Accept all incoming branch changes"
              >
                Accept Incoming
              </button>
            </>
          )}
          {!readOnly && (
            <button
              className={`editor-button editor-button-save ${hasUnsavedChanges ? 'editor-button-save-active' : ''}`}
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              title={hasUnsavedChanges ? 'Save changes (Ctrl+S)' : 'No changes to save'}
              aria-label={hasUnsavedChanges ? 'Save changes (Ctrl+S)' : 'No changes to save'}
            >
              {hasUnsavedChanges ? 'Save *' : 'Saved'}
            </button>
          )}
        </div>
      </div>
      <div 
        className="editor-content"
        role="textbox"
        aria-labelledby="editor-file-path"
        aria-multiline="true"
      >
        <MonacoEditor
          height="100%"
          language={detectedLanguage}
          value={currentContent}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            ariaLabel: `Code editor for ${filePath}`,
          }}
        />
      </div>
    </div>
  );
};
