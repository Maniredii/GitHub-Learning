import questValidationService from '../questValidationService';
import { RepositoryState } from '../../../../shared/src/types';
import { ValidationCriteria } from '../../models/Quest';

describe('Quest Validation Service Tests', () => {
  describe('validateCommitExists', () => {
    test('should pass when minimum commits requirement is met', () => {
      const criteria: ValidationCriteria = {
        type: 'commit_exists',
        parameters: { minimumCommits: 2 },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'First commit',
            author: 'Test User',
            timestamp: new Date(),
            parent: null,
            tree: {},
          },
          {
            hash: 'def456',
            message: 'Second commit',
            author: 'Test User',
            timestamp: new Date(),
            parent: 'abc123',
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'def456' }],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('Great work');
    });

    test('should fail when minimum commits requirement is not met', () => {
      const criteria: ValidationCriteria = {
        type: 'commit_exists',
        parameters: { minimumCommits: 3 },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'First commit',
            author: 'Test User',
            timestamp: new Date(),
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'abc123' }],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('at least 3 commit');
      expect(result.details?.expected).toBe(3);
      expect(result.details?.actual).toBe(1);
    });

    test('should validate specific commit message', () => {
      const criteria: ValidationCriteria = {
        type: 'commit_exists',
        parameters: { commitMessage: 'Initial commit' },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Initial commit',
            author: 'Test User',
            timestamp: new Date(),
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'abc123' }],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
    });
  });

  describe('validateBranchExists', () => {
    test('should pass when branch exists', () => {
      const criteria: ValidationCriteria = {
        type: 'branch_exists',
        parameters: { branchName: 'feature' },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [
          { name: 'main', commitHash: 'abc123' },
          { name: 'feature', commitHash: 'def456' },
        ],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('Excellent');
    });

    test('should fail when branch does not exist', () => {
      const criteria: ValidationCriteria = {
        type: 'branch_exists',
        parameters: { branchName: 'feature' },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: 'abc123' }],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('Branch "feature" not found');
    });

    test('should validate minimum number of branches', () => {
      const criteria: ValidationCriteria = {
        type: 'branch_exists',
        parameters: { minimumBranches: 2 },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [
          { name: 'main', commitHash: 'abc123' },
          { name: 'feature', commitHash: 'def456' },
        ],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
    });
  });

  describe('validateFileContent', () => {
    test('should pass when file exists', () => {
      const criteria: ValidationCriteria = {
        type: 'file_content',
        parameters: { filePath: 'README.md', fileExists: true },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'README.md': { content: '# Test Project', modified: false },
        },
        stagingArea: {},
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
    });

    test('should fail when file does not exist', () => {
      const criteria: ValidationCriteria = {
        type: 'file_content',
        parameters: { filePath: 'README.md', fileExists: true },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('does not exist');
    });

    test('should validate file contains specific text', () => {
      const criteria: ValidationCriteria = {
        type: 'file_content',
        parameters: { filePath: 'README.md', containsText: 'Test Project' },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'README.md': { content: '# Test Project\n\nThis is a test.', modified: false },
        },
        stagingArea: {},
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
    });
  });

  describe('validateMergeCompleted', () => {
    test('should pass when merge commit exists', () => {
      const criteria: ValidationCriteria = {
        type: 'merge_completed',
        parameters: {},
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Merge branch feature',
            author: 'Test User',
            timestamp: new Date(),
            parent: 'def456',
            parents: ['def456', 'ghi789'],
            tree: {},
          },
        ],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('Excellent merge');
    });

    test('should fail when no merge commit exists', () => {
      const criteria: ValidationCriteria = {
        type: 'merge_completed',
        parameters: {},
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Regular commit',
            author: 'Test User',
            timestamp: new Date(),
            parent: null,
            tree: {},
          },
        ],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('No merge commit found');
    });

    test('should detect unresolved conflicts', () => {
      const criteria: ValidationCriteria = {
        type: 'merge_completed',
        parameters: { noConflicts: true },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {
          'file.txt': {
            content: '<<<<<<< HEAD\nContent A\n=======\nContent B\n>>>>>>> feature',
            modified: true,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Merge branch feature',
            author: 'Test User',
            timestamp: new Date(),
            parent: 'def456',
            parents: ['def456', 'ghi789'],
            tree: {},
          },
        ],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(false);
      expect(result.feedback).toContain('unresolved conflicts');
    });
  });

  describe('validateCustom', () => {
    test('should pass for manual completion', () => {
      const criteria: ValidationCriteria = {
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
    });

    test('should validate repository initialization', () => {
      const criteria: ValidationCriteria = {
        type: 'custom',
        parameters: { checkRepositoryInitialized: true },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('initialized');
    });

    test('should validate staging area', () => {
      const criteria: ValidationCriteria = {
        type: 'custom',
        parameters: { checkStagingArea: true, minimumFiles: 1 },
      };

      const state: RepositoryState = {
        id: 'test-repo',
        workingDirectory: {},
        stagingArea: {
          'file.txt': { content: 'test', modified: false },
        },
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      };

      const result = questValidationService.validateQuest(criteria, state);

      expect(result.success).toBe(true);
      expect(result.feedback).toContain('staged successfully');
    });
  });
});
