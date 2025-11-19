import { Commit } from './Commit';
import { Branch } from './Branch';
import { FileTree, Remote } from 'shared/src/types';

/**
 * Repository - Represents a Git repository with all its state
 * This is the main class that maintains the repository state
 */
export class Repository {
  public workingDirectory: FileTree;
  public stagingArea: FileTree;
  public commits: Map<string, Commit>;
  public branches: Map<string, Branch>;
  public head: string; // Branch name or commit hash (detached HEAD)
  public remotes: Remote[];

  constructor(
    workingDirectory: FileTree = {},
    stagingArea: FileTree = {},
    commits: Commit[] = [],
    branches: Branch[] = [],
    head: string = 'main',
    remotes: Remote[] = []
  ) {
    this.workingDirectory = workingDirectory;
    this.stagingArea = stagingArea;
    this.commits = new Map();
    this.branches = new Map();
    this.head = head;
    this.remotes = remotes;

    // Populate commits map
    commits.forEach(commit => this.commits.set(commit.hash, commit));
    
    // Populate branches map
    branches.forEach(branch => this.branches.set(branch.name, branch));
  }

  /**
   * Get the current branch
   */
  getCurrentBranch(): Branch | null {
    return this.branches.get(this.head) || null;
  }

  /**
   * Get the current commit (HEAD points to)
   */
  getCurrentCommit(): Commit | null {
    const branch = this.getCurrentBranch();
    if (branch) {
      return this.commits.get(branch.commitHash) || null;
    }
    // Detached HEAD - head is a commit hash
    return this.commits.get(this.head) || null;
  }

  /**
   * Check if HEAD is detached
   */
  isDetachedHead(): boolean {
    return !this.branches.has(this.head);
  }

  /**
   * Get a commit by hash
   */
  getCommit(hash: string): Commit | null {
    return this.commits.get(hash) || null;
  }

  /**
   * Get a branch by name
   */
  getBranch(name: string): Branch | null {
    return this.branches.get(name) || null;
  }

  /**
   * Add a commit to the repository
   */
  addCommit(commit: Commit): void {
    this.commits.set(commit.hash, commit);
  }

  /**
   * Add a branch to the repository
   */
  addBranch(branch: Branch): void {
    this.branches.set(branch.name, branch);
  }

  /**
   * Update the HEAD pointer
   */
  updateHead(target: string): void {
    this.head = target;
  }

  /**
   * Get all commits as an array
   */
  getCommitsArray(): Commit[] {
    return Array.from(this.commits.values());
  }

  /**
   * Get all branches as an array
   */
  getBranchesArray(): Branch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Create a new repository with initial branch
   */
  static create(initialFiles: FileTree = {}): Repository {
    const repo = new Repository(initialFiles);
    
    // Create initial main branch (points to null initially)
    const mainBranch = Branch.create('main', '');
    repo.addBranch(mainBranch);
    
    return repo;
  }

  /**
   * Serialize repository to JSON
   */
  toJSON() {
    return {
      workingDirectory: this.workingDirectory,
      stagingArea: this.stagingArea,
      commits: this.getCommitsArray().map(c => c.toJSON()),
      branches: this.getBranchesArray().map(b => b.toJSON()),
      head: this.head,
      remotes: this.remotes
    };
  }

  /**
   * Create a Repository from JSON
   */
  static fromJSON(json: any): Repository {
    const commits = json.commits.map((c: any) => 
      new Commit(c.hash, c.message, c.author, new Date(c.timestamp), c.parent, c.tree, c.parents)
    );
    const branches = json.branches.map((b: any) => Branch.fromJSON(b));
    
    return new Repository(
      json.workingDirectory,
      json.stagingArea,
      commits,
      branches,
      json.head,
      json.remotes || []
    );
  }
}
