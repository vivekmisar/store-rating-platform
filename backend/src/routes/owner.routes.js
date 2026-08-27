import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getOwnerDashboard } from '../controllers/owner.controller.js';
import { ROLES } from '../utils/validation.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.STORE_OWNER));
router.get('/dashboard', asyncHandler(getOwnerDashboard));

export default router;
