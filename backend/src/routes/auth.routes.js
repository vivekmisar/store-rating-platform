import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { changePassword, login, logout, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.put('/password', authenticate, asyncHandler(changePassword));
router.post('/logout', authenticate, asyncHandler(logout));

export default router;
