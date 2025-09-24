import { Router } from 'express';
import * as PackageController from '../Controllers/package-controller.js';

const router = Router();

router.get('/:id', PackageController.getPackageById);

export default router;
