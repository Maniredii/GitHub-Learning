import { Tree } from './Tree';
import { FileTree } from 'shared/src/types';

/**
 * Commit - Represents a commit in the Git object model
 * Contains metadata and a snapshot of the repository at a point in time
 */
export class Commit {
  constructor(
    public readonly hash: string,
    public readonly message: string,
    public readonly author: string,
    public readonly timestamp: Date,
    public readonly parent: string | null,
    public readonly tree: FileTree,
    public readonly parents?: string[] // For merge commits
  ) {}

  /**
   * Check if this is a merge commit
   */
  get isMergeCommit(): boolean {
    return this.parents !== undefined && this.parents.length > 1;
  }

  /**
   * Get all parent commit hashes
   */
  getParents(): string[] {
    if (this.parents && this.parents.length > 0) {
      return this.parents;
    }
    return this.parent ? [this.parent] : [];
  }

  /**
   * Create a new commit
   */
  static create(
    message: string,
    author: string,
    tree: FileTree,
    parent: string | null = null,
    parents?: string[]
  ): Commit {
    const timestamp = new Date();
    const hash = Commit.generateHash(message, author, timestamp, tree, parent, parents);
    
    return new Commit(hash, message, author, timestamp, parent, tree, parents);
  }

  /**
   * Generate a unique hash for the commit
   */
  private static generateHash(
    message: string,
    author: string,
    timestamp: Date,
    tree: FileTree,
    parent: string | null,
    parents?: string[]
  ): string {
    const crypto = require('crypto');
    const treeContent = JSON.stringify(tree);
    const parentInfo = parents && parents.length > 0 
      ? parents.join(',') 
      : (parent || 'root');
    
    const content = `commit
tree ${treeContent}
parent ${parentInfo}
author ${author}
date ${timestamp.toISOString()}

${message}`;
    
    return crypto.createHash('sha1').update(content).digest('hex');
  }

  /**
   * Get a short version of the commit hash (first 7 characters)
   */
  get shortHash(): string {
    return this.hash.substring(0, 7);
  }

  /**
   * Format commit for display (similar to git log)
   */
  format(oneline: boolean = false): string {
    if (oneline) {
      return `${this.shortHash} ${this.message}`;
    }

    return `commit ${this.hash}
Author: ${this.author}
Date:   ${this.timestamp.toUTCString()}

    ${this.message}
`;
  }

  /**
   * Serialize commit to JSON
   */
  toJSON() {
    return {
      hash: this.hash,
      message: this.message,
      author: this.author,
      timestamp: this.timestamp,
      parent: this.parent,
      parents: this.parents,
      tree: this.tree
    };
  }
}
