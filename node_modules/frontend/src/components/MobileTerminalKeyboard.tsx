import React from 'react';
import './MobileTerminalKeyboard.css';

interface MobileTerminalKeyboardProps {
  onCommandInsert: (command: string) => void;
  onKeyPress: (key: string) => void;
  visible: boolean;
}

const GIT_COMMANDS = [
  { label: 'status', command: 'git status' },
  { label: 'add .', command: 'git add .' },
  { label: 'commit', command: 'git commit -m ""', cursorBack: 1 },
  { label: 'log', command: 'git log' },
  { label: 'branch', command: 'git branch' },
  { label: 'checkout', command: 'git checkout ' },
  { label: 'merge', command: 'git merge ' },
  { label: 'push', command: 'git push' },
  { label: 'pull', command: 'git pull' },
  { label: 'clone', command: 'git clone ' },
];

export const MobileTerminalKeyboard: React.FC<MobileTerminalKeyboardProps> = ({
  onCommandInsert,
  onKeyPress,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div 
      className="mobile-keyboard" 
      id="mobile-keyboard"
      role="toolbar"
      aria-label="Mobile Git command keyboard"
    >
      <div className="mobile-keyboard__header">
        <span className="mobile-keyboard__title" id="keyboard-title">Git Commands</span>
      </div>

      <div 
        className="mobile-keyboard__commands"
        role="group"
        aria-labelledby="keyboard-title"
      >
        {GIT_COMMANDS.map((cmd) => (
          <button
            key={cmd.label}
            className="mobile-keyboard__command-btn"
            onClick={() => onCommandInsert(cmd.command)}
            type="button"
            aria-label={`Insert ${cmd.command} command`}
          >
            {cmd.label}
          </button>
        ))}
      </div>

      <div 
        className="mobile-keyboard__special-keys"
        role="group"
        aria-label="Special keys"
      >
        <button
          className="mobile-keyboard__key mobile-keyboard__key--wide"
          onClick={() => onKeyPress('Enter')}
          type="button"
          aria-label="Press Enter key"
        >
          ↵ Enter
        </button>
        <button
          className="mobile-keyboard__key"
          onClick={() => onKeyPress('Backspace')}
          type="button"
          aria-label="Press Backspace key"
        >
          ⌫
        </button>
        <button
          className="mobile-keyboard__key"
          onClick={() => onKeyPress('Tab')}
          type="button"
          aria-label="Press Tab key for autocomplete"
        >
          Tab
        </button>
        <button
          className="mobile-keyboard__key"
          onClick={() => onKeyPress('ArrowUp')}
          type="button"
          aria-label="Navigate to previous command in history"
        >
          ↑
        </button>
        <button
          className="mobile-keyboard__key"
          onClick={() => onKeyPress('ArrowDown')}
          type="button"
          aria-label="Navigate to next command in history"
        >
          ↓
        </button>
      </div>
    </div>
  );
};
