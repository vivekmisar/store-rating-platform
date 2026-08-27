import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createStore,
  createUser,
  getDashboard,
  getUserById,
  listStores,
  listUsers
} from '../controllers/admin.controller.js';
import { ROLES } from '../utils/validation.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN));
router.get('/dashboard', asyncHandler(getDashboard));
router.get('/users', asyncHandler(listUsers));
router.get('/users/:id', asyncHandler(getUserById));
router.post('/users', asyncHandler(createUser));
router.get('/stores', asyncHandler(listStores));
router.post('/stores', asyncHandler(createStore));

export default router;
