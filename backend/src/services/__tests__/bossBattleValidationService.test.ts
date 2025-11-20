import bossBattleValidationService from '../bossBattleValidationService';
import { RepositoryState } from '../../../../shared/src/types';
import { ValidationCriteria } from '../../models/Quest';

describe('Boss Battle Validation Service Tests', () => {
  describe('Corrupted Timeline Validation', () => {
    const corruptedTimelineConditions: ValidationCriteria[] = [
      {
        type: 'custom',
        parameters: {
          validator: 'corrupted_timeline',
          description: 'Repository must be restored to commit abc123 or def456',
          requiredCommitHashes: ['abc123', 'def456'],
        },
      },
    ];

    test('should fail when on corrupted commit', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'README.md': {
            content: 'This file has been corrupted!',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Good commit',
            author: 'Test',
            timestamp: new Date(),
            parent: null,
            tree: {
              'README.md': {
                content: 'Good content',
                modified: false,
              },
            },
          },
          {
            hash: 'ghi789',
            message: 'Corrupted commit',
            author: 'Test',
            timestamp: new Date(),
            parent: 'abc123',
            tree: {
              'README.md': {
                content: 'This file has been corrupted!',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'ghi789',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        corruptedTimelineConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('corruption persists');
      expect(result.details?.issue).toBe('wrong_commit');
    });

    test('should succeed when restored to good commit', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'README.md': {
            content: 'Good content',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Good commit',
            author: 'Test',
            timestamp: new Date(),
            parent: null,
            tree: {
              'README.md': {
                content: 'Good content',
                modified: false,
              },
            },
          },
          {
            hash: 'ghi789',
            message: 'Corrupted commit',
            author: 'Test',
            timestamp: new Date(),
            parent: 'abc123',
            tree: {
              'README.md': {
                content: 'Corrupted!',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'abc123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        corruptedTimelineConditions,
        repositoryState
      );

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('Victory');
      expect(result.details?.restoredCommit).toBe('abc123');
    });

    test('should fail when working directory does not match commit', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'README.md': {
            content: 'Modified content',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Good commit',
            author: 'Test',
            timestamp: new Date(),
            parent: null,
            tree: {
              'README.md': {
                content: 'Good content',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'abc123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        corruptedTimelineConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('corrupted data');
      expect(result.details?.issue).toBe('working_directory_mismatch');
    });
  });

  describe('Convergence Conflict Validation', () => {
    const convergenceConflictConditions: ValidationCriteria[] = [
      {
        type: 'custom',
        parameters: {
          validator: 'convergence_conflict',
          description: 'Conflict must be resolved and merge completed',
          requiredBranch: 'main',
          mustHaveMergeCommit: true,
          fileMustNotHaveConflictMarkers: 'story.txt',
        },
      },
    ];

    test('should fail when not on required branch', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [
          {
            name: 'feature',
            commitHash: 'abc123',
          },
        ],
        head: 'feature',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        convergenceConflictConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('must be on the main branch');
      expect(result.details?.issue).toBe('wrong_branch');
    });

    test('should fail when merge not performed', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'story.txt': {
            content: 'Some content',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Regular commit',
            author: 'Test',
            timestamp: new Date(),
            parent: null,
            tree: {
              'story.txt': {
                content: 'Some content',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'abc123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        convergenceConflictConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('not been unified');
      expect(result.details?.issue).toBe('no_merge_commit');
    });

    test('should fail when conflict markers present', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'story.txt': {
            content: `Some content
<<<<<<< HEAD
Version A
=======
Version B
>>>>>>> feature`,
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'merge123',
            message: 'Merge commit',
            author: 'Test',
            timestamp: new Date(),
            parent: 'abc123',
            parents: ['abc123', 'def456'],
            tree: {
              'story.txt': {
                content: 'Merged content',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'merge123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        convergenceConflictConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('not been fully resolved');
      expect(result.details?.issue).toBe('conflict_markers_present');
    });

    test('should succeed when conflict properly resolved', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'story.txt': {
            content: 'Merged content without conflict markers',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'merge123',
            message: 'Merge commit',
            author: 'Test',
            timestamp: new Date(),
            parent: 'abc123',
            parents: ['abc123', 'def456'],
            tree: {
              'story.txt': {
                content: 'Merged content',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'merge123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        convergenceConflictConditions,
        repositoryState
      );

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('Victory');
      expect(result.details?.mergeCommit).toBe('merge123');
    });

    test('should fail when merge not committed', () => {
      const repositoryState: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'story.txt': {
            content: 'Merged content',
            modified: false,
          },
        },
        stagingArea: {
          'story.txt': {
            content: 'Merged content',
            modified: false,
          },
        },
        commits: [
          {
            hash: 'merge123',
            message: 'Merge commit',
            author: 'Test',
            timestamp: new Date(),
            parent: 'abc123',
            parents: ['abc123', 'def456'],
            tree: {
              'story.txt': {
                content: 'Merged content',
                modified: false,
              },
            },
          },
        ],
        branches: [
          {
            name: 'main',
            commitHash: 'merge123',
          },
        ],
        head: 'main',
        remotes: [],
      };

      const result = bossBattleValidationService.validateBossBattle(
        convergenceConflictConditions,
        repositoryState
      );

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('not yet complete');
      expect(result.details?.issue).toBe('uncommitted_changes');
    });
  });
});
