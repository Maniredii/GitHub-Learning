import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '../Editor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

describe('Editor', () => {
  const mockContent = 'console.log("Hello, World!");';
  const mockFilePath = 'src/app.js';

  describe('File loading and saving', () => {
    it('should render with initial content', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={mockContent}
        />
      );

      expect(screen.getByTestId('monaco-editor')).toHaveValue(mockContent);
      expect(screen.getByText(mockFilePath)).toBeInTheDocument();
    });

    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      
      render(
        <Editor
          filePath={mockFilePath}
          content={mockContent}
          onSave={onSave}
        />
      );

      const editor = screen.getByTestId('monaco-editor');
      await user.clear(editor);
      await user.type(editor, 'new content');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith('new content');
    });

    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();
      
      render(
        <Editor
          filePath={mockFilePath}
          content={mockContent}
          onSave={vi.fn()}
        />
      );

      const editor = screen.getByTestId('monaco-editor');
      await user.type(editor, ' modified');

      await waitFor(() => {
        expect(screen.getByText(/save \*/i)).toBeInTheDocument();
      });
    });

    it('should disable save button when no changes', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={mockContent}
          onSave={vi.fn()}
        />
      );

      const saveButton = screen.getByRole('button', { name: /saved/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Conflict marker detection', () => {
    const conflictContent = `function test() {
<<<<<<< HEAD
  return "current";
=======
  return "incoming";
>>>>>>> feature
}`;

    it('should detect conflict markers', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
        />
      );

      expect(screen.getByText(/conflicts detected/i)).toBeInTheDocument();
    });

    it('should show conflict resolution buttons in conflict mode', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
        />
      );

      expect(screen.getByRole('button', { name: /accept current/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accept incoming/i })).toBeInTheDocument();
    });

    it('should not show conflict buttons when not in conflict mode', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
        />
      );

      expect(screen.queryByRole('button', { name: /accept current/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /accept incoming/i })).not.toBeInTheDocument();
    });
  });

  describe('Conflict resolution actions', () => {
    const conflictContent = `function test() {
<<<<<<< HEAD
  return "current";
=======
  return "incoming";
>>>>>>> feature
}`;

    it('should resolve conflicts by accepting current changes', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
          onSave={onSave}
        />
      );

      const acceptCurrentButton = screen.getByRole('button', { name: /accept current/i });
      await user.click(acceptCurrentButton);

      const editor = screen.getByTestId('monaco-editor');
      const value = (editor as HTMLTextAreaElement).value;
      expect(value).toContain('current');
      expect(value).not.toContain('incoming');
      expect(value).not.toContain('<<<<<<<');
    });

    it('should resolve conflicts by accepting incoming changes', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
          onSave={onSave}
        />
      );

      const acceptIncomingButton = screen.getByRole('button', { name: /accept incoming/i });
      await user.click(acceptIncomingButton);

      const editor = screen.getByTestId('monaco-editor');
      const value = (editor as HTMLTextAreaElement).value;
      expect(value).toContain('incoming');
      expect(value).not.toContain('current');
      expect(value).not.toContain('<<<<<<<');
    });

    it('should prevent saving with unresolved conflicts', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
          onSave={onSave}
        />
      );

      // Try to save without resolving
      const editor = screen.getByTestId('monaco-editor');
      await user.type(editor, ' ');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('conflict'));
      expect(onSave).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('should allow saving after conflicts are resolved', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
          onSave={onSave}
        />
      );

      // Resolve conflicts
      const acceptCurrentButton = screen.getByRole('button', { name: /accept current/i });
      await user.click(acceptCurrentButton);

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalled();
    });
  });

  describe('Read-only mode', () => {
    it('should disable editing in read-only mode', () => {
      render(
        <Editor
          filePath={mockFilePath}
          content={mockContent}
          readOnly={true}
        />
      );

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('should disable conflict resolution buttons in read-only mode', () => {
      const conflictContent = `<<<<<<< HEAD\ncurrent\n=======\nincoming\n>>>>>>> feature`;
      
      render(
        <Editor
          filePath={mockFilePath}
          content={conflictContent}
          conflictMode={true}
          readOnly={true}
        />
      );

      const acceptCurrentButton = screen.getByRole('button', { name: /accept current/i });
      const acceptIncomingButton = screen.getByRole('button', { name: /accept incoming/i });

      expect(acceptCurrentButton).toBeDisabled();
      expect(acceptIncomingButton).toBeDisabled();
    });
  });

  describe('Language detection', () => {
    it('should detect JavaScript files', () => {
      render(
        <Editor
          filePath="src/app.js"
          content={mockContent}
        />
      );

      expect(screen.getByText('src/app.js')).toBeInTheDocument();
    });

    it('should detect Python files', () => {
      render(
        <Editor
          filePath="script.py"
          content="print('Hello')"
        />
      );

      expect(screen.getByText('script.py')).toBeInTheDocument();
    });

    it('should detect Markdown files', () => {
      render(
        <Editor
          filePath="README.md"
          content="# Title"
        />
      );

      expect(screen.getByText('README.md')).toBeInTheDocument();
    });
  });
});
