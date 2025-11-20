/**
 * Conflict resolution utilities for Git merge conflicts
 */

export interface ConflictMarkers {
  hasConflicts: boolean;
  conflicts: ConflictRegion[];
}

export interface ConflictRegion {
  startLine: number;
  endLine: number;
  currentContent: string;
  incomingContent: string;
  separatorLine: number;
}

/**
 * Detect if content has Git conflict markers
 */
export function hasConflictMarkers(content: string): boolean {
  return (
    content.includes('<<<<<<<') &&
    content.includes('=======') &&
    content.includes('>>>>>>>')
  );
}

/**
 * Parse conflict markers from content
 */
export function parseConflicts(content: string): ConflictMarkers {
  const lines = content.split('\n');
  const conflicts: ConflictRegion[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Look for conflict start marker
    if (line.startsWith('<<<<<<<')) {
      const startLine = i;
      let separatorLine = -1;
      let endLine = -1;

      // Find separator
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('=======')) {
          separatorLine = j;
          break;
        }
      }

      // Find end marker
      if (separatorLine !== -1) {
        for (let j = separatorLine + 1; j < lines.length; j++) {
          if (lines[j].startsWith('>>>>>>>')) {
            endLine = j;
            break;
          }
        }
      }

      // If we found a complete conflict region
      if (separatorLine !== -1 && endLine !== -1) {
        const currentContent = lines.slice(startLine + 1, separatorLine).join('\n');
        const incomingContent = lines.slice(separatorLine + 1, endLine).join('\n');

        conflicts.push({
          startLine,
          endLine,
          currentContent,
          incomingContent,
          separatorLine,
        });

        i = endLine + 1;
        continue;
      }
    }

    i++;
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Resolve conflict by accepting current changes
 */
export function acceptCurrent(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('<<<<<<<')) {
      // Find separator
      let separatorLine = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('=======')) {
          separatorLine = j;
          break;
        }
      }

      // Find end marker
      let endLine = -1;
      if (separatorLine !== -1) {
        for (let j = separatorLine + 1; j < lines.length; j++) {
          if (lines[j].startsWith('>>>>>>>')) {
            endLine = j;
            break;
          }
        }
      }

      // Add current changes (between start and separator)
      if (separatorLine !== -1 && endLine !== -1) {
        for (let j = i + 1; j < separatorLine; j++) {
          result.push(lines[j]);
        }
        i = endLine + 1;
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * Resolve conflict by accepting incoming changes
 */
export function acceptIncoming(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('<<<<<<<')) {
      // Find separator
      let separatorLine = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('=======')) {
          separatorLine = j;
          break;
        }
      }

      // Find end marker
      let endLine = -1;
      if (separatorLine !== -1) {
        for (let j = separatorLine + 1; j < lines.length; j++) {
          if (lines[j].startsWith('>>>>>>>')) {
            endLine = j;
            break;
          }
        }
      }

      // Add incoming changes (between separator and end)
      if (separatorLine !== -1 && endLine !== -1) {
        for (let j = separatorLine + 1; j < endLine; j++) {
          result.push(lines[j]);
        }
        i = endLine + 1;
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * Validate that all conflicts have been resolved
 */
export function validateResolution(content: string): {
  isResolved: boolean;
  remainingConflicts: number;
} {
  const { conflicts } = parseConflicts(content);
  return {
    isResolved: conflicts.length === 0,
    remainingConflicts: conflicts.length,
  };
}
