import React, { useEffect, useState } from 'react';
import { Editor, type EditorProps } from './Editor';
import { gitApi } from '../services/gitApi';

export interface ConnectedEditorProps extends Omit<EditorProps, 'content' | 'onSave'> {
  repositoryId: string;
  onSaveSuccess?: (filePath: string, content: string) => void;
  onSaveError?: (error: Error) => void;
  onLoadError?: (error: Error) => void;
}

/**
 * ConnectedEditor - Editor component connected to the Git engine API
 * 
 * This component automatically loads file content from the repository
 * and saves changes back to the working directory.
 */
export const ConnectedEditor: React.FC<ConnectedEditorProps> = ({
  repositoryId,
  filePath,
  onSaveSuccess,
  onSaveError,
  onLoadError,
  ...editorProps
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load file content when component mounts or filePath changes
  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const file = await gitApi.getFileContent(repositoryId, filePath);
        setContent(file.content);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
        setError(errorMessage);
        if (onLoadError && err instanceof Error) {
          onLoadError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [repositoryId, filePath, onLoadError]);

  const handleSave = async (newContent: string) => {
    setSaving(true);
    setError(null);

    try {
      await gitApi.updateFileContent(repositoryId, filePath, newContent);
      setContent(newContent);
      
      if (onSaveSuccess) {
        onSaveSuccess(filePath, newContent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save file';
      setError(errorMessage);
      if (onSaveError && err instanceof Error) {
        onSaveError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-container">
        <div className="editor-loading">
          <div className="editor-loading-spinner"></div>
          <div className="editor-loading-text">Loading {filePath}...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-container">
        <div className="editor-error">
          <div className="editor-error-icon">⚠️</div>
          <div className="editor-error-message">{error}</div>
          <button 
            className="editor-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Editor
      {...editorProps}
      filePath={filePath}
      content={content}
      onSave={handleSave}
      readOnly={editorProps.readOnly || saving}
    />
  );
};
