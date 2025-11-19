import { GitEngine } from '../GitEngine';
import { Repository } from '../models';

describe('GitEngine Core Functionality', () => {
  let gitEngine: GitEngine;

  beforeEach(() => {
    // Create a new repository with some initial files
    const repo = Repository.create({
      'README.md': { content: '# Test Project', modified: false },
      'index.js': { content: 'console.log("Hello");', modified: false }
    });
    gitEngine = new GitEngine(repo);
  });

  describe('Working Directory and Staging', () => {
    test('should add a single file to staging area', () => {
      const result = gitEngine.add('README.md');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Added');
      
      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md']).toBeDefined();
    });

    test('should add all files to staging area', () => {
      const result = gitEngine.addAll();
      
      expect(result.success).toBe(true);
      
      const repo = gitEngine.getRepository();
      expect(Object.keys(repo.stagingArea).length).toBe(2);
      expect(repo.stagingArea['README.md']).toBeDefined();
      expect(repo.stagingArea['index.js']).toBeDefined();
    });

    test('should fail to add non-existent file', () => {
      const result = gitEngine.add('nonexistent.txt');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should show status with untracked files', () => {
      const result = gitEngine.status();
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Untracked files');
      expect(result.output).toContain('README.md');
      expect(result.output).toContain('index.js');
    });

    test('should show status with staged files', () => {
      gitEngine.add('README.md');
      const result = gitEngine.status();
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Changes to be committed');
      expect(result.output).toContain('README.md');
    });
  });

  describe('Commit Functionality', () => {
    test('should create a commit with staged changes', () => {
      gitEngine.addAll();
      const result = gitEngine.commit('Initial commit', 'Test User');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Initial commit');
      
      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(1);
      expect(Object.keys(repo.stagingArea).length).toBe(0);
    });

    test('should fail to commit without staged changes', () => {
      const result = gitEngine.commit('Empty commit');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No changes staged');
    });

    test('should fail to commit with empty message', () => {
      gitEngine.addAll();
      const result = gitEngine.commit('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('should link commits with parent', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');
      
      gitEngine.modifyFile('README.md', '# Updated Project');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');
      
      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(2);
      
      const commits = Array.from(repo.commits.values());
      const secondCommit = commits[1];
      expect(secondCommit.parent).toBe(commits[0].hash);
    });
  });

  describe('Log Operations', () => {
    test('should display commit history', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');
      
      const result = gitEngine.log();
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('commit');
      expect(result.output).toContain('First commit');
      expect(result.output).toContain('Author:');
    });

    test('should display oneline log format', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');
      
      const result = gitEngine.logOneline();
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('First commit');
      expect(result.output).not.toContain('Author:');
    });

    test('should fail log on empty repository', () => {
      const result = gitEngine.log();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No commits');
    });

    test('should display multiple commits in history', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');
      
      gitEngine.modifyFile('README.md', '# Updated');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');
      
      const result = gitEngine.log();
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('First commit');
      expect(result.output).toContain('Second commit');
    });
  });

  describe('File Operations', () => {
    test('should modify existing file', () => {
      const result = gitEngine.modifyFile('README.md', '# Modified Content');
      
      expect(result.success).toBe(true);
      
      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md'].content).toBe('# Modified Content');
      expect(repo.workingDirectory['README.md'].modified).toBe(true);
    });

    test('should create new file', () => {
      const result = gitEngine.createFile('newfile.txt', 'New content');
      
      expect(result.success).toBe(true);
      
      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['newfile.txt']).toBeDefined();
      expect(repo.workingDirectory['newfile.txt'].content).toBe('New content');
    });

    test('should fail to create duplicate file', () => {
      const result = gitEngine.createFile('README.md', 'Content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('should delete file', () => {
      const result = gitEngine.deleteFile('README.md');
      
      expect(result.success).toBe(true);
      
      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md']).toBeUndefined();
    });
  });
});
