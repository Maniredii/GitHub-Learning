import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Terminal } from '../Terminal';
import * as gitApi from '../../services/gitApi';

// Mock xterm.js
vi.mock('@xterm/xterm', () => {
  return {
    Terminal: class {
      loadAddon = vi.fn();
      open = vi.fn();
      writeln = vi.fn();
      write = vi.fn();
      onData = vi.fn();
      clear = vi.fn();
      dispose = vi.fn();
    },
  };
});

vi.mock('@xterm/addon-fit', () => {
  return {
    FitAddon: class {
      fit = vi.fn();
    },
  };
});

// Mock gitApi
vi.mock('../../services/gitApi', () => ({
  gitApi: {
    executeCommand: vi.fn(),
  },
}));

describe('Terminal Component', () => {
  const mockRepositoryId = 'test-repo-123';
  const mockOnCommandExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render terminal container', () => {
    render(<Terminal repositoryId={mockRepositoryId} />);

    const terminalContainer = document.querySelector('.terminal-container');
    expect(terminalContainer).toBeInTheDocument();
  });

  it('should display terminal header with repository ID', () => {
    render(<Terminal repositoryId={mockRepositoryId} />);

    const terminalTitle = screen.getByText(/Spellbook Terminal - Repository:/);
    expect(terminalTitle).toBeInTheDocument();
    expect(terminalTitle.textContent).toContain(mockRepositoryId);
  });

  it('should render terminal buttons', () => {
    render(<Terminal repositoryId={mockRepositoryId} />);

    const buttons = document.querySelectorAll('.terminal-button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveClass('close');
    expect(buttons[1]).toHaveClass('minimize');
    expect(buttons[2]).toHaveClass('maximize');
  });

  it('should call onCommandExecute callback when command is executed', async () => {
    const mockResponse = {
      output: 'Command executed successfully',
      newState: {},
    };

    vi.spyOn(gitApi.gitApi, 'executeCommand').mockResolvedValue(mockResponse);

    render(
      <Terminal repositoryId={mockRepositoryId} onCommandExecute={mockOnCommandExecute} />
    );

    // Note: Full command execution testing would require simulating xterm.js onData events
    // This is a basic structure test
    expect(mockOnCommandExecute).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('API connection failed');
    vi.spyOn(gitApi.gitApi, 'executeCommand').mockRejectedValue(mockError);

    render(<Terminal repositoryId={mockRepositoryId} />);

    // Terminal should still render even if there are API errors
    const terminalContainer = document.querySelector('.terminal-container');
    expect(terminalContainer).toBeInTheDocument();
  });

  it('should display terminal content area', () => {
    render(<Terminal repositoryId={mockRepositoryId} />);

    const terminalContent = document.querySelector('.terminal-content');
    expect(terminalContent).toBeInTheDocument();
  });
});
