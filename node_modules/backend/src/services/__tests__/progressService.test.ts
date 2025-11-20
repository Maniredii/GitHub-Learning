import ProgressService from '../progressService';

describe('Progress Service Tests', () => {
  describe('calculateLevel', () => {
    test('should return level 1 for 0 XP', () => {
      expect(ProgressService.calculateLevel(0)).toBe(1);
    });

    test('should return level 1 for XP below level 2 threshold', () => {
      expect(ProgressService.calculateLevel(50)).toBe(1);
      expect(ProgressService.calculateLevel(99)).toBe(1);
    });

    test('should return level 2 at 100 XP', () => {
      expect(ProgressService.calculateLevel(100)).toBe(2);
    });

    test('should return level 3 at 250 XP', () => {
      expect(ProgressService.calculateLevel(250)).toBe(3);
    });

    test('should return level 4 at 450 XP', () => {
      expect(ProgressService.calculateLevel(450)).toBe(4);
    });

    test('should return level 5 at 700 XP', () => {
      expect(ProgressService.calculateLevel(700)).toBe(5);
    });

    test('should return correct level for mid-range XP', () => {
      expect(ProgressService.calculateLevel(150)).toBe(2);
      expect(ProgressService.calculateLevel(300)).toBe(3);
      expect(ProgressService.calculateLevel(500)).toBe(4);
    });

    test('should handle high XP values', () => {
      expect(ProgressService.calculateLevel(10450)).toBe(20);
      expect(ProgressService.calculateLevel(15000)).toBe(20);
    });
  });

  describe('getRankForLevel', () => {
    test('should return "Apprentice Coder" for level 1-2', () => {
      expect(ProgressService.getRankForLevel(1)).toBe('Apprentice Coder');
      expect(ProgressService.getRankForLevel(2)).toBe('Apprentice Coder');
    });

    test('should return "Journeyman Archivist" for level 3-5', () => {
      expect(ProgressService.getRankForLevel(3)).toBe('Journeyman Archivist');
      expect(ProgressService.getRankForLevel(4)).toBe('Journeyman Archivist');
      expect(ProgressService.getRankForLevel(5)).toBe('Journeyman Archivist');
    });

    test('should return "Skilled Chrono-Coder" for level 6-9', () => {
      expect(ProgressService.getRankForLevel(6)).toBe('Skilled Chrono-Coder');
      expect(ProgressService.getRankForLevel(9)).toBe('Skilled Chrono-Coder');
    });

    test('should return "Master Time-Weaver" for level 10-14', () => {
      expect(ProgressService.getRankForLevel(10)).toBe('Master Time-Weaver');
      expect(ProgressService.getRankForLevel(14)).toBe('Master Time-Weaver');
    });

    test('should return "Legendary Git Guardian" for level 15-19', () => {
      expect(ProgressService.getRankForLevel(15)).toBe('Legendary Git Guardian');
      expect(ProgressService.getRankForLevel(19)).toBe('Legendary Git Guardian');
    });

    test('should return "Eternal Repository Keeper" for level 20+', () => {
      expect(ProgressService.getRankForLevel(20)).toBe('Eternal Repository Keeper');
      expect(ProgressService.getRankForLevel(25)).toBe('Eternal Repository Keeper');
    });
  });

  describe('getXpForNextLevel', () => {
    test('should return 100 XP for level 1', () => {
      expect(ProgressService.getXpForNextLevel(1)).toBe(100);
    });

    test('should return 250 XP for level 2', () => {
      expect(ProgressService.getXpForNextLevel(2)).toBe(250);
    });

    test('should return 450 XP for level 3', () => {
      expect(ProgressService.getXpForNextLevel(3)).toBe(450);
    });

    test('should return null for max level', () => {
      expect(ProgressService.getXpForNextLevel(20)).toBe(null);
    });

    test('should return null for levels beyond max', () => {
      expect(ProgressService.getXpForNextLevel(25)).toBe(null);
    });
  });

  describe('XP and Level Integration', () => {
    test('should correctly calculate level progression', () => {
      // Starting at level 1 with 0 XP
      let xp = 0;
      expect(ProgressService.calculateLevel(xp)).toBe(1);

      // Earn 50 XP - still level 1
      xp += 50;
      expect(ProgressService.calculateLevel(xp)).toBe(1);

      // Earn another 50 XP - now level 2
      xp += 50;
      expect(ProgressService.calculateLevel(xp)).toBe(2);

      // Earn 150 more XP - now level 3
      xp += 150;
      expect(ProgressService.calculateLevel(xp)).toBe(3);
    });

    test('should handle level-up at exact threshold', () => {
      expect(ProgressService.calculateLevel(99)).toBe(1);
      expect(ProgressService.calculateLevel(100)).toBe(2);
      expect(ProgressService.calculateLevel(249)).toBe(2);
      expect(ProgressService.calculateLevel(250)).toBe(3);
    });
  });
});
