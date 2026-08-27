import { Router } from 'express';
import { listStores, getStoreById, assertCanListStores } from '../controllers/store.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.use(assertCanListStores);
router.get('/', asyncHandler(listStores));
router.get('/:id', asyncHandler(getStoreById));

export default router;
