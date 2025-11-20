import { useState } from 'react';
import { GitGraph } from './GitGraph';
import { ConnectedGitGraph } from './ConnectedGitGraph';

/**
 * Example 1: Basic GitGraph with static data
 */
export function BasicGitGraphExample() {
  const commits = [
    {
      hash: 'a1b2c3d4e5f6',
      message: 'Initial commit',
      author: 'Chrono-Coder',
      timestamp: new Date('2024-01-01T10:00:00'),
      parent: null,
      tree: {},
    },
    {
      hash: 'b2c3d4e5f6a1',
      message: 'Add README.md',
      author: 'Chrono-Coder',
      timestamp: new Date('2024-01-01T11:00:00'),
      parent: 'a1b2c3d4e5f6',
      tree: {},
    },
    {
      hash: 'c3d4e5f6a1b2',
      message: 'Create feature branch',
      author: 'Chrono-Coder',
      timestamp: new Date('2024-01-01T12:00:00'),
      parent: 'b2c3d4e5f6a1',
      tree: {},
    },
  ];

  const branches = [
    { name: 'main', commitHash: 'c3d4e5f6a1b2' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Basic Git Graph</h2>
      <GitGraph
        commits={commits}
        branches={branches}
        currentHead="main"
        onCommitClick={(hash) => alert(`Clicked commit: ${hash}`)}
      />
    </div>
  );
}

/**
 * Example 2: GitGraph with multiple branches
 */
export function MultiBranchGitGraphExample() {
  const commits = [
    {
      hash: 'a1b2c3d',
      message: 'Initial commit',
      author: 'Player',
      timestamp: new Date('2024-01-01T10:00:00'),
      parent: null,
      tree: {},
    },
    {
      hash: 'b2c3d4e',
      message: 'Add feature A',
      author: 'Player',
      timestamp: new Date('2024-01-01T11:00:00'),
      parent: 'a1b2c3d',
      tree: {},
    },
    {
      hash: 'c3d4e5f',
      message: 'Start feature B',
      author: 'Player',
      timestamp: new Date('2024-01-01T12:00:00'),
      parent: 'a1b2c3d',
      tree: {},
    },
    {
      hash: 'd4e5f6a',
      message: 'Complete feature B',
      author: 'Player',
      timestamp: new Date('2024-01-01T13:00:00'),
      parent: 'c3d4e5f',
      tree: {},
    },
    {
      hash: 'e5f6a1b',
      message: 'Merge feature B into main',
      author: 'Player',
      timestamp: new Date('2024-01-01T14:00:00'),
      parent: 'b2c3d4e',
      parents: ['b2c3d4e', 'd4e5f6a'],
      tree: {},
    },
  ];

  const branches = [
    { name: 'main', commitHash: 'e5f6a1b' },
    { name: 'feature-b', commitHash: 'd4e5f6a' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Multi-Branch Git Graph</h2>
      <GitGraph
        commits={commits}
        branches={branches}
        currentHead="main"
      />
    </div>
  );
}

/**
 * Example 3: Empty state
 */
export function EmptyGitGraphExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Empty Git Graph</h2>
      <GitGraph
        commits={[]}
        branches={[]}
        currentHead="main"
      />
    </div>
  );
}

/**
 * Example 4: Connected GitGraph with API integration
 */
export function ConnectedGitGraphExample() {
  const [repositoryId] = useState('test-repo-123');
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleCommitClick = (hash: string) => {
    console.log('Commit clicked:', hash);
    alert(`Viewing commit: ${hash}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Connected Git Graph</h2>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            background: '#00ff41',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Refresh Graph
        </button>
      </div>
      <ConnectedGitGraph
        repositoryId={repositoryId}
        refreshTrigger={refreshCounter}
        onCommitClick={handleCommitClick}
      />
    </div>
  );
}

/**
 * Example 5: Integrated with Terminal (Real-time updates)
 */
export function IntegratedExample() {
  const [repositoryId] = useState('quest-repo-456');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [commits, setCommits] = useState([
    {
      hash: 'a1b2c3d',
      message: 'Initial commit',
      author: 'Player',
      timestamp: new Date(),
      parent: null,
      tree: {},
    },
  ]);

  const handleCommandExecute = (command: string, output: string) => {
    console.log('Command executed:', command);
    console.log('Output:', output);

    // Refresh graph after Git commands that modify the repository
    const modifyingCommands = ['commit', 'branch', 'checkout', 'merge', 'reset'];
    if (modifyingCommands.some((cmd) => command.includes(cmd))) {
      setRefreshCounter((prev) => prev + 1);
    }
  };

  const simulateCommit = () => {
    const newCommit = {
      hash: Math.random().toString(36).substring(7),
      message: `Commit at ${new Date().toLocaleTimeString()}`,
      author: 'Player',
      timestamp: new Date(),
      parent: commits[commits.length - 1].hash,
      tree: {},
    };
    setCommits([...commits, newCommit]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Integrated Terminal + Git Graph (Real-time Updates)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Terminal</h3>
          {/* Terminal component would go here */}
          <div
            style={{
              background: '#1a1a2e',
              padding: '20px',
              borderRadius: '8px',
              color: '#00ff41',
              fontFamily: 'monospace',
            }}
          >
            <p>$ git commit -m "Example commit"</p>
            <p>[main abc123] Example commit</p>
            <button
              onClick={() => {
                simulateCommit();
                handleCommandExecute('git commit -m "test"', 'Success');
              }}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#00ff41',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              Simulate Commit (Watch Animation!)
            </button>
          </div>
        </div>
        <div>
          <h3>Repository Graph</h3>
          <GitGraph
            commits={commits}
            branches={[{ name: 'main', commitHash: commits[commits.length - 1].hash }]}
            currentHead="main"
            enableAnimations={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: Auto-refresh with polling
 */
export function AutoRefreshExample() {
  const [repositoryId] = useState('auto-refresh-repo');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Auto-Refresh Git Graph (Polling every 5 seconds)</h2>
      <p style={{ color: '#aaa', marginBottom: '16px' }}>
        This graph automatically polls the API every 5 seconds for updates
      </p>
      <ConnectedGitGraph
        repositoryId={repositoryId}
        autoRefresh={true}
        refreshInterval={5000}
        enableAnimations={true}
      />
    </div>
  );
}

/**
 * Example 7: All examples in one page
 */
export function AllGitGraphExamples() {
  return (
    <div style={{ padding: '20px', background: '#0f0f1e', minHeight: '100vh' }}>
      <h1 style={{ color: '#00ff41', textAlign: 'center' }}>
        GitGraph Component Examples
      </h1>

      <div style={{ marginTop: '40px' }}>
        <BasicGitGraphExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <MultiBranchGitGraphExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <EmptyGitGraphExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <ConnectedGitGraphExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <IntegratedExample />
      </div>

      <div style={{ marginTop: '40px' }}>
        <AutoRefreshExample />
      </div>
    </div>
  );
}
