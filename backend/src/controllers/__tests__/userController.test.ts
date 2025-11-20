import { Request, Response } from 'express';
import { UserController } from '../userController';
import { UserService } from '../../services/userService';

// Mock UserService
jest.mock('../../services/userService');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {
      user: {
        userId: 'test-user-id',
        username: 'testuser',
      },
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockProfile = {
        user: {
          id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
        },
        progress: {
          xp: 150,
          level: 2,
          rank: 'Apprentice Coder',
          currentChapter: 'chapter-1',
          currentQuest: 'quest-1',
        },
        statistics: {
          questsCompleted: 5,
          chaptersUnlocked: 2,
          achievementsEarned: 3,
        },
        achievements: [
          {
            id: 'achievement-1',
            name: 'First Blood',
            description: 'Made your first commit',
            badgeIcon: '🎯',
            earnedAt: new Date('2024-01-01'),
          },
        ],
      };

      (UserService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(UserService.getUserProfile).toHaveBeenCalledWith('test-user-id');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockProfile);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    });

    it('should return 500 on service error', async () => {
      (UserService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching user profile',
        },
      });
    });
  });
});
