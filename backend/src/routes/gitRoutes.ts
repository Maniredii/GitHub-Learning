import { Router } from 'express';
import {
  executeCommand,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
} from '../controllers/gitController';

const router = Router();

/**
 * POST /api/git/execute
 * Execute a Git command against a repository
 */
router.post('/execute', executeCommand);

/**
 * GET /api/git/repository/:id
 * Get the current state of a repository
 */
router.get('/repository/:id', getRepository);

/**
 * POST /api/git/repository/create
 * Create a new repository with optional initial files
 */
router.post('/repository/create', createRepository);

/**
 * PUT /api/git/repository/:id
 * Update a repository state
 */
router.put('/repository/:id', updateRepository);

/**
 * DELETE /api/git/repository/:id
 * Delete a repository
 */
router.delete('/repository/:id', deleteRepository);

export default router;
