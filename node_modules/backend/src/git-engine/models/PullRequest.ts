/**
 * PullRequest - Represents a pull request in the simulated Git system
 * Stores information about a proposed merge from one branch to another
 */
export class PullRequest {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly sourceUrl: string,
    public readonly sourceBranch: string,
    public readonly targetUrl: string,
    public readonly targetBranch: string,
    public readonly author: string,
    public readonly createdAt: Date,
    public status: 'open' | 'merged' | 'closed',
    public mergedAt?: Date
  ) {}

  /**
   * Create a new pull request
   */
  static create(
    title: string,
    description: string,
    sourceUrl: string,
    sourceBranch: string,
    targetUrl: string,
    targetBranch: string,
    author: string = 'Chrono-Coder'
  ): PullRequest {
    const id = PullRequest.generateId();
    const createdAt = new Date();

    return new PullRequest(
      id,
      title,
      description,
      sourceUrl,
      sourceBranch,
      targetUrl,
      targetBranch,
      author,
      createdAt,
      'open'
    );
  }

  /**
   * Generate a unique ID for the pull request
   */
  private static generateId(): string {
    return `pr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Mark the pull request as merged
   */
  merge(): void {
    this.status = 'merged';
    this.mergedAt = new Date();
  }

  /**
   * Close the pull request without merging
   */
  close(): void {
    this.status = 'closed';
  }

  /**
   * Serialize pull request to JSON
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      sourceUrl: this.sourceUrl,
      sourceBranch: this.sourceBranch,
      targetUrl: this.targetUrl,
      targetBranch: this.targetBranch,
      author: this.author,
      createdAt: this.createdAt,
      status: this.status,
      mergedAt: this.mergedAt,
    };
  }

  /**
   * Create a PullRequest from JSON
   */
  static fromJSON(json: any): PullRequest {
    return new PullRequest(
      json.id,
      json.title,
      json.description,
      json.sourceUrl,
      json.sourceBranch,
      json.targetUrl,
      json.targetBranch,
      json.author,
      new Date(json.createdAt),
      json.status,
      json.mergedAt ? new Date(json.mergedAt) : undefined
    );
  }
}
