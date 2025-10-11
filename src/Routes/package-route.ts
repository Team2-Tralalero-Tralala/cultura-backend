import { Router } from 'express';
import { authMiddleware } from '~/Middlewares/auth-middleware.js';
import { getPackageById } from '../Controllers/package-controller.js';

const router = Router();

router.get('/:id', authMiddleware, getPackageById);

export default router;