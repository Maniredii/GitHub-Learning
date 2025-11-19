import { Blob } from './Blob';

/**
 * TreeEntry - Represents a single entry in a tree (file or subdirectory)
 */
export interface TreeEntry {
  name: string;
  type: 'blob' | 'tree';
  hash: string;
  mode: string; // File permissions (e.g., '100644' for regular file)
}

/**
 * Tree - Represents a directory snapshot in the Git object model
 * Trees contain references to blobs (files) and other trees (subdirectories)
 */
export class Tree {
  private entries: Map<string, TreeEntry>;

  constructor(
    public readonly hash: string,
    entries: TreeEntry[] = []
  ) {
    this.entries = new Map();
    entries.forEach(entry => this.entries.set(entry.name, entry));
  }

  /**
   * Add an entry to the tree
   */
  addEntry(entry: TreeEntry): void {
    this.entries.set(entry.name, entry);
  }

  /**
   * Get an entry by name
   */
  getEntry(name: string): TreeEntry | undefined {
    return this.entries.get(name);
  }

  /**
   * Get all entries in the tree
   */
  getEntries(): TreeEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Check if tree contains an entry
   */
  hasEntry(name: string): boolean {
    return this.entries.has(name);
  }

  /**
   * Create a Tree from a file structure
   */
  static create(fileStructure: Record<string, string>): Tree {
    const entries: TreeEntry[] = [];
    
    for (const [path, content] of Object.entries(fileStructure)) {
      const blob = Blob.create(content);
      entries.push({
        name: path,
        type: 'blob',
        hash: blob.hash,
        mode: '100644' // Regular file
      });
    }

    const hash = Tree.generateHash(entries);
    return new Tree(hash, entries);
  }

  /**
   * Generate a hash for the tree based on its entries
   */
  private static generateHash(entries: TreeEntry[]): string {
    const crypto = require('crypto');
    const content = entries
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(e => `${e.mode} ${e.type} ${e.hash}\t${e.name}`)
      .join('\n');
    return crypto.createHash('sha1').update(`tree ${content}`).digest('hex');
  }

  /**
   * Serialize tree to JSON
   */
  toJSON() {
    return {
      type: 'tree',
      hash: this.hash,
      entries: this.getEntries()
    };
  }
}
