/**
 * Routes for KS (Kaltura Session) related endpoints
 */
import { Router } from 'express';
import { ksController } from '../controllers/ks.controller';

// Create a new router instance
const router = Router();

/**
 * POST /api/ks
 * Generates a Kaltura Session token with required privileges
 */
router.post('/', ksController.generateKs.bind(ksController));

export default router;