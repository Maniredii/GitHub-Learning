import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGitGraphUpdates, useGitOperationDetection } from '../useGitGraphUpdates';

describe('useGitGraphUpdates Hook', () => {
  it('initializes with refreshTrigger of 0', () => {
    const { result } = renderHook(() => useGitGraphUpdates());

    expect(result.current.refreshTrigger).toBe(0);
  });

  it('increments refreshTrigger when triggerRefresh is called', () => {
    const { result } = renderHook(() => useGitGraphUpdates());

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(1);

    act(() => {
      result.current.triggerRefresh();
    });

    expect(result.current.refreshTrigger).toBe(2);
  });

  it('identifies graph-modifying commands', () => {
    const { result } = renderHook(() => useGitGraphUpdates());

    expect(result.current.isGraphModifyingCommand('git commit -m "test"')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git branch feature')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git checkout main')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git merge feature')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git reset HEAD~1')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git rebase main')).toBe(true);
    expect(result.current.isGraphModifyingCommand('git push origin main')).toBe(true);
  });

  it('identifies non-modifying commands', () => {
    const { result } = renderHook(() => useGitGraphUpdates());

    expect(result.current.isGraphModifyingCommand('git status')).toBe(false);
    expect(result.current.isGraphModifyingCommand('git log')).toBe(false);
    expect(result.current.isGraphModifyingCommand('git diff')).toBe(false);
    expect(result.current.isGraphModifyingCommand('git show')).toBe(false);
    expect(result.current.isGraphModifyingCommand('clear')).toBe(false);
  });

  it('triggers refresh for successful modifying commands', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGitGraphUpdates());

    const initialTrigger = result.current.refreshTrigger;

    act(() => {
      result.current.handleCommandExecute(
        'git commit -m "test"',
        '[main abc123] test'
      );
    });

    // Fast-forward timers to trigger the delayed refresh
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.refreshTrigger).toBe(initialTrigger + 1);

    vi.useRealTimers();
  });

  it('does not trigger refresh for failed commands', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGitGraphUpdates());

    const initialTrigger = result.current.refreshTrigger;

    act(() => {
      result.current.handleCommandExecute(
        'git commit -m "test"',
        'error: nothing to commit'
      );
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.refreshTrigger).toBe(initialTrigger);

    vi.useRealTimers();
  });

  it('does not trigger refresh for non-modifying commands', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGitGraphUpdates());

    const initialTrigger = result.current.refreshTrigger;

    act(() => {
      result.current.handleCommandExecute(
        'git status',
        'On branch main\nnothing to commit'
      );
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.refreshTrigger).toBe(initialTrigger);

    vi.useRealTimers();
  });
});

describe('useGitOperationDetection Hook', () => {
  it('initializes with null operation', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    expect(result.current.lastOperation.type).toBe(null);
    expect(result.current.lastOperation.timestamp).toBe(0);
  });

  it('detects commit operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git commit -m "test"');
    });

    expect(result.current.lastOperation.type).toBe('commit');
    expect(result.current.lastOperation.timestamp).toBeGreaterThan(0);
  });

  it('detects branch operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git branch feature');
    });

    expect(result.current.lastOperation.type).toBe('branch');
  });

  it('detects merge operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git merge feature');
    });

    expect(result.current.lastOperation.type).toBe('merge');
  });

  it('detects checkout operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git checkout main');
    });

    expect(result.current.lastOperation.type).toBe('checkout');
  });

  it('detects reset operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git reset HEAD~1');
    });

    expect(result.current.lastOperation.type).toBe('reset');
  });

  it('updates timestamp on each detection', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('git commit -m "first"');
    });

    const firstTimestamp = result.current.lastOperation.timestamp;

    // Wait a bit
    act(() => {
      result.current.detectOperation('git commit -m "second"');
    });

    const secondTimestamp = result.current.lastOperation.timestamp;

    expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
  });

  it('does not update for non-git operations', () => {
    const { result } = renderHook(() => useGitOperationDetection());

    act(() => {
      result.current.detectOperation('clear');
    });

    expect(result.current.lastOperation.type).toBe(null);
  });
});
