import { Terminal } from './Terminal';

/**
 * Example usage of the Terminal component
 * 
 * This demonstrates how to integrate the Terminal component into your application.
 */
export const TerminalExample = () => {
  const handleCommandExecute = (command: string, output: string) => {
    console.log('Command executed:', command);
    console.log('Output:', output);
  };

  const handleClear = () => {
    console.log('Terminal cleared');
  };

  return (
    <div style={{ width: '100%', height: '600px', padding: '20px' }}>
      <Terminal
        repositoryId="example-repo-123"
        onCommandExecute={handleCommandExecute}
        onClear={handleClear}
      />
    </div>
  );
};
