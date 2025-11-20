import { describe, it, expect } from 'vitest';
import {
  hasConflictMarkers,
  parseConflicts,
  acceptCurrent,
  acceptIncoming,
  validateResolution,
} from '../conflictResolver';

describe('conflictResolver', () => {
  const conflictContent = `function greet(name) {
<<<<<<< HEAD
  return "Hello, " + name + "!";
=======
  return \`Hi, \${name}!\`;
>>>>>>> feature-branch
}`;

  const resolvedCurrentContent = `function greet(name) {
  return "Hello, " + name + "!";
}`;

  const resolvedIncomingContent = `function greet(name) {
  return \`Hi, \${name}!\`;
}`;

  describe('hasConflictMarkers', () => {
    it('should detect conflict markers', () => {
      expect(hasConflictMarkers(conflictContent)).toBe(true);
    });

    it('should return false for content without conflicts', () => {
      expect(hasConflictMarkers(resolvedCurrentContent)).toBe(false);
    });
  });

  describe('parseConflicts', () => {
    it('should parse conflict regions', () => {
      const result = parseConflicts(conflictContent);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].currentContent).toContain('Hello');
      expect(result.conflicts[0].incomingContent).toContain('Hi');
    });

    it('should return empty conflicts for resolved content', () => {
      const result = parseConflicts(resolvedCurrentContent);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('acceptCurrent', () => {
    it('should resolve conflicts by accepting current changes', () => {
      const resolved = acceptCurrent(conflictContent);
      
      expect(resolved).toContain('Hello');
      expect(resolved).not.toContain('Hi');
      expect(resolved).not.toContain('<<<<<<<');
      expect(resolved).not.toContain('=======');
      expect(resolved).not.toContain('>>>>>>>');
    });
  });

  describe('acceptIncoming', () => {
    it('should resolve conflicts by accepting incoming changes', () => {
      const resolved = acceptIncoming(conflictContent);
      
      expect(resolved).toContain('Hi');
      expect(resolved).not.toContain('Hello');
      expect(resolved).not.toContain('<<<<<<<');
      expect(resolved).not.toContain('=======');
      expect(resolved).not.toContain('>>>>>>>');
    });
  });

  describe('validateResolution', () => {
    it('should validate that conflicts are resolved', () => {
      const result = validateResolution(resolvedCurrentContent);
      
      expect(result.isResolved).toBe(true);
      expect(result.remainingConflicts).toBe(0);
    });

    it('should detect remaining conflicts', () => {
      const result = validateResolution(conflictContent);
      
      expect(result.isResolved).toBe(false);
      expect(result.remainingConflicts).toBe(1);
    });
  });
});
