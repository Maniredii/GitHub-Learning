/**
 * Branch - Represents a branch pointer in Git
 * A branch is simply a named reference to a commit
 */
export class Branch {
  constructor(
    public readonly name: string,
    public commitHash: string
  ) {}

  /**
   * Update the branch to point to a new commit
   */
  updateCommit(commitHash: string): void {
    (this as any).commitHash = commitHash;
  }

  /**
   * Create a new branch
   */
  static create(name: string, commitHash: string): Branch {
    return new Branch(name, commitHash);
  }

  /**
   * Check if this is the default branch
   */
  get isDefault(): boolean {
    return this.name === 'main' || this.name === 'master';
  }

  /**
   * Serialize branch to JSON
   */
  toJSON() {
    return {
      name: this.name,
      commitHash: this.commitHash
    };
  }

  /**
   * Create a Branch from JSON
   */
  static fromJSON(json: { name: string; commitHash: string }): Branch {
    return new Branch(json.name, json.commitHash);
  }
}
