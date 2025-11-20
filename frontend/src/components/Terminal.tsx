import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './Terminal.css';
import { gitApi } from '../services/gitApi';

interface TerminalProps {
  repositoryId: string;
  onCommandExecute?: (command: string, output: string) => void;
  onCommandError?: (command: string, error: string) => void;
  initialState?: any;
  onClear?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  repositoryId,
  onCommandExecute,
  onCommandError,
  onClear,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const currentLineRef = useRef('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const PROMPT = '\x1b[1;32m$\x1b[0m ';

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Fira Code", "Courier New", monospace',
      theme: {
        background: '#1a1a2e',
        foreground: '#eee',
        cursor: '#00ff41',
        cursorAccent: '#1a1a2e',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#000000',
        red: '#ff6b6b',
        green: '#00ff41',
        yellow: '#ffd93d',
        blue: '#6bcfff',
        magenta: '#ff6bff',
        cyan: '#6bffff',
        white: '#ffffff',
        brightBlack: '#555555',
        brightRed: '#ff8888',
        brightGreen: '#88ff88',
        brightYellow: '#ffff88',
        brightBlue: '#88ccff',
        brightMagenta: '#ff88ff',
        brightCyan: '#88ffff',
        brightWhite: '#ffffff',
      },
      cols: 80,
      rows: 24,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;36m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;33mWelcome to GitQuest: The Chrono-Coder\'s Journey\x1b[0m      \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m  \x1b[90mYour Spellbook Terminal is ready...\x1b[0m                  \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.write(PROMPT);

    // Handle keyboard input
    term.onData((data) => {
      if (isExecuting) return;

      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        const command = currentLineRef.current.trim();
        term.writeln('');

        if (command) {
          executeCommand(command);
        } else {
          term.write(PROMPT);
        }

        currentLineRef.current = '';
        historyIndexRef.current = -1;
        return;
      }

      // Handle Backspace
      if (code === 127) {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          term.write('\b \b');
        }
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        term.writeln('^C');
        currentLineRef.current = '';
        historyIndexRef.current = -1;
        term.write(PROMPT);
        return;
      }

      // Handle Ctrl+L (clear screen)
      if (code === 12) {
        clearTerminal();
        return;
      }

      // Handle arrow keys (escape sequences)
      if (data === '\x1b[A') {
        // Up arrow - previous command
        handleHistoryNavigation('up');
        return;
      }

      if (data === '\x1b[B') {
        // Down arrow - next command
        handleHistoryNavigation('down');
        return;
      }

      // Handle Tab key
      if (code === 9) {
        handleTabCompletion();
        return;
      }

      // Handle printable characters
      if (code >= 32 && code < 127) {
        currentLineRef.current += data;
        term.write(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const executeCommand = async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    // Add to history
    setCommandHistory((prev) => [...prev, command]);

    // Handle built-in commands
    if (command === 'clear') {
      clearTerminal();
      return;
    }

    setIsExecuting(true);

    // Show loading indicator
    term.writeln('\x1b[90m⟳ Executing spell...\x1b[0m');

    try {
      const response = await gitApi.executeCommand(repositoryId, command);

      if (response.error) {
        // Display error with game-themed styling
        term.writeln('\x1b[1;31m✗ Your spell fizzled!\x1b[0m');
        term.writeln('\x1b[31m' + response.error + '\x1b[0m');
        
        // Add helpful hints for common mistakes
        if (response.error.includes('not a git command')) {
          term.writeln('\x1b[33m💡 Hint: Try "git status" or press Tab for suggestions\x1b[0m');
        }

        // Call error callback if provided
        if (onCommandError) {
          onCommandError(command, response.error);
        }
      } else {
        // Display success output
        if (response.output) {
          const lines = response.output.split('\n');
          lines.forEach((line) => {
            term.writeln(line);
          });
        }

        // Call success callback if provided
        if (onCommandExecute) {
          onCommandExecute(command, response.output || '');
        }
      }
    } catch (error) {
      term.writeln('\x1b[1;31m✗ Connection to the Chrono-Realm failed!\x1b[0m');
      term.writeln(
        '\x1b[31m' + (error instanceof Error ? error.message : 'Unknown error') + '\x1b[0m'
      );
    } finally {
      setIsExecuting(false);
      term.write(PROMPT);
    }
  };

  const handleHistoryNavigation = (direction: 'up' | 'down') => {
    const term = xtermRef.current;
    if (!term || commandHistory.length === 0) return;

    // Clear current line
    const currentLength = currentLineRef.current.length;
    for (let i = 0; i < currentLength; i++) {
      term.write('\b \b');
    }

    if (direction === 'up') {
      if (historyIndexRef.current < commandHistory.length - 1) {
        historyIndexRef.current++;
      }
    } else {
      if (historyIndexRef.current > -1) {
        historyIndexRef.current--;
      }
    }

    if (historyIndexRef.current === -1) {
      currentLineRef.current = '';
    } else {
      const historyCommand =
        commandHistory[commandHistory.length - 1 - historyIndexRef.current];
      currentLineRef.current = historyCommand;
      term.write(historyCommand);
    }
  };

  const handleTabCompletion = () => {
    const term = xtermRef.current;
    if (!term) return;

    const gitCommands = [
      'git add',
      'git commit',
      'git status',
      'git log',
      'git branch',
      'git checkout',
      'git merge',
      'git push',
      'git pull',
      'git clone',
      'git remote',
      'git reset',
      'git fetch',
      'git diff',
      'git init',
      'clear',
    ];

    const currentInput = currentLineRef.current;
    const matches = gitCommands.filter((cmd) => cmd.startsWith(currentInput));

    if (matches.length === 1) {
      // Single match - complete it
      const completion = matches[0].slice(currentInput.length);
      currentLineRef.current += completion;
      term.write(completion);
    } else if (matches.length > 1) {
      // Multiple matches - show them
      term.writeln('');
      matches.forEach((match) => {
        term.writeln('\x1b[36m  ' + match + '\x1b[0m');
      });
      term.write(PROMPT + currentInput);
    }
  };

  const clearTerminal = () => {
    const term = xtermRef.current;
    if (!term) return;

    term.clear();
    term.writeln('\x1b[1;36m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m  \x1b[1;33mWelcome to GitQuest: The Chrono-Coder\'s Journey\x1b[0m      \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m  \x1b[90mYour Spellbook Terminal is ready...\x1b[0m                  \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.write(PROMPT + currentLineRef.current);

    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-button close"></span>
          <span className="terminal-button minimize"></span>
          <span className="terminal-button maximize"></span>
        </div>
        <div className="terminal-title">Spellbook Terminal - Repository: {repositoryId}</div>
      </div>
      <div ref={terminalRef} className="terminal-content" />
    </div>
  );
};
