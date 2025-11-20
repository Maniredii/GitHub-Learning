import { useState, useCallback } from 'react';

/**
 * Hook for managing Git graph updates and refresh triggers
 * 
 * Usage:
 * ```tsx
 * const { refreshTrigger, triggerRefresh } = useGitGraphUpdates();
 * 
 * // In Terminal component
 * const handleCommandExecute = (command: string) => {
 *   if (isGraphModifyingCommand(command)) {
 *     triggerRefresh();
 *   }
 * };
 * 
 * // In GitGraph component
 * <ConnectedGitGraph refreshTrigger={refreshTrigger} />
 * ```
 */
export function useGitGraphUpdates() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const isGraphModifyingCommand = useCallback((command: string): boolean => {
    const modifyingCommands = [
      'commit',
      'branch',
      'checkout',
      'merge',
      'reset',
      'rebase',
      'cherry-pick',
      'revert',
      'tag',
      'push',
      'pull',
      'fetch',
      'clone',
    ];

    return modifyingCommands.some((cmd) => command.includes(cmd));
  }, []);

  const handleCommandExecute = useCallback(
    (command: string, output: string) => {
      // Only refresh if command was successful and modifies the graph
      const isSuccess = !output.toLowerCase().includes('error') && 
                       !output.toLowerCase().includes('failed');
      
      if (isSuccess && isGraphModifyingCommand(command)) {
        // Small delay to ensure backend has processed the change
        setTimeout(() => {
          triggerRefresh();
        }, 100);
      }
    },
    [isGraphModifyingCommand, triggerRefresh]
  );

  return {
    refreshTrigger,
    triggerRefresh,
    isGraphModifyingCommand,
    handleCommandExecute,
  };
}

/**
 * Hook for detecting specific Git operations for targeted animations
 */
export function useGitOperationDetection() {
  const [lastOperation, setLastOperation] = useState<{
    type: 'commit' | 'branch' | 'merge' | 'checkout' | 'reset' | null;
    timestamp: number;
  }>({
    type: null,
    timestamp: 0,
  });

  const detectOperation = useCallback((command: string) => {
    const timestamp = Date.now();

    if (command.includes('commit')) {
      setLastOperation({ type: 'commit', timestamp });
    } else if (command.includes('branch')) {
      setLastOperation({ type: 'branch', timestamp });
    } else if (command.includes('merge')) {
      setLastOperation({ type: 'merge', timestamp });
    } else if (command.includes('checkout')) {
      setLastOperation({ type: 'checkout', timestamp });
    } else if (command.includes('reset')) {
      setLastOperation({ type: 'reset', timestamp });
    }
  }, []);

  return {
    lastOperation,
    detectOperation,
  };
}
