import { Commit } from './Commit';
import { Branch } from './Branch';
import { RemoteRepository } from './RemoteRepository';
import { PullRequest } from './PullRequest';
import { FileTree, Remote } from 'shared/src/types';

/**
 * Repository - Represents a Git repository with all its state
 * This is the main class that maintains the repository state
 */
export class Repository {
  // Static storage for simulated remote repositories
  private static remoteRepositories: Map<string, RemoteRepository> = new Map();

  // Static storage for pull requests
  private static pullRequests: Map<string, PullRequest> = new Map();

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
    commits.forEach((commit) => this.commits.set(commit.hash, commit));

    // Populate branches map
    branches.forEach((branch) => this.branches.set(branch.name, branch));
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
   * Update a file in the working directory
   */
  updateFile(filePath: string, content: string): void {
    this.workingDirectory[filePath] = {
      content,
      modified: true,
    };
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
      commits: this.getCommitsArray().map((c) => c.toJSON()),
      branches: this.getBranchesArray().map((b) => b.toJSON()),
      head: this.head,
      remotes: this.remotes,
    };
  }

  /**
   * Create a Repository from JSON
   */
  static fromJSON(json: any): Repository {
    const commits = json.commits.map(
      (c: any) =>
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

  /**
   * Add a remote to this repository
   */
  addRemote(name: string, url: string): void {
    // Check if remote already exists
    if (this.remotes.find((r) => r.name === name)) {
      throw new Error(`Remote '${name}' already exists`);
    }

    this.remotes.push({
      name,
      url,
      branches: [],
    });
  }

  /**
   * Get a remote by name
   */
  getRemote(name: string): Remote | null {
    return this.remotes.find((r) => r.name === name) || null;
  }

  /**
   * Update remote branches
   */
  updateRemoteBranches(remoteName: string, branches: Branch[]): void {
    const remote = this.getRemote(remoteName);
    if (remote) {
      remote.branches = branches.map((b) => ({ name: b.name, commitHash: b.commitHash }));
    }
  }

  /**
   * Static method to register a remote repository in the global storage
   */
  static registerRemoteRepository(remoteRepo: RemoteRepository): void {
    Repository.remoteRepositories.set(remoteRepo.url, remoteRepo);
  }

  /**
   * Static method to get a remote repository from global storage
   */
  static getRemoteRepository(url: string): RemoteRepository | null {
    return Repository.remoteRepositories.get(url) || null;
  }

  /**
   * Static method to create and register a new remote repository
   */
  static createRemoteRepository(name: string, url: string): RemoteRepository {
    const remoteRepo = RemoteRepository.create(name, url);
    Repository.registerRemoteRepository(remoteRepo);
    return remoteRepo;
  }

  /**
   * Static method to clear all remote repositories (useful for testing)
   */
  static clearRemoteRepositories(): void {
    Repository.remoteRepositories.clear();
  }

  /**
   * Static method to store a pull request
   */
  static storePullRequest(pr: PullRequest): void {
    Repository.pullRequests.set(pr.id, pr);
  }

  /**
   * Static method to get a pull request by ID
   */
  static getPullRequest(id: string): PullRequest | null {
    return Repository.pullRequests.get(id) || null;
  }

  /**
   * Static method to get all pull requests for a target repository
   */
  static getPullRequestsForTarget(targetUrl: string): PullRequest[] {
    return Array.from(Repository.pullRequests.values()).filter((pr) => pr.targetUrl === targetUrl);
  }

  /**
   * Static method to clear all pull requests (useful for testing)
   */
  static clearPullRequests(): void {
    Repository.pullRequests.clear();
  }
}
