/**
 * Controller for KS (Kaltura Session) related endpoints
 */
import { Request, Response } from 'express';
import { kalturaService } from '../services/kaltura.service';
import { validateKsRequest, formatValidationError } from '../utils/validation';

/**
 * Controller for handling KS generation requests
 */
export class KsController {
  /**
   * Generates a Kaltura Session token
   * @param req - Express request object
   * @param res - Express response object
   */
  async generateKs(req: Request, res: Response): Promise<void> {
    try {
      // Validate the request body
      const { error, value } = validateKsRequest(req.body);
      
      if (error) {
        res.status(400).json(formatValidationError(error));
        return;
      }

      // Generate the KS token
      const ks = await kalturaService.generateKs({
        entryId: value.entryId
      });

      // Return the KS token
      res.status(200).json({ ks });
    } catch (error) {
      console.error('Error in KS controller:', error);
      res.status(500).json({
        error: 'Failed to generate KS token',
        status: 500
      });
    }
  }
}

// Export a singleton instance of the controller
export const ksController = new KsController();