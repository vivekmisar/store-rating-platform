import { Router } from 'express';
import { createRating, updateRating } from '../controllers/rating.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/validation.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.USER));
router.post('/', asyncHandler(createRating));
router.put('/:id', asyncHandler(updateRating));

export default router;
