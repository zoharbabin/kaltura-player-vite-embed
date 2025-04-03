/**
 * Input validation utilities for the Kaltura video embedding application
 * Uses Joi for schema validation
 */
import Joi from 'joi';

/**
 * Schema for validating KS generation requests
 */
export const ksRequestSchema = Joi.object({
  entryId: Joi.string().pattern(/^[0-9]_[a-zA-Z0-9]{8,}$/).optional()
    .description('Kaltura entry ID (optional, defaults to configured value)')
});

/**
 * Validates the request body against the KS request schema
 * @param data - The request body to validate
 * @returns The validation result with value and error properties
 */
export const validateKsRequest = (data: unknown) => {
  return ksRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
};

/**
 * Formats validation errors into a user-friendly response
 * @param error - The Joi validation error
 * @returns An object with formatted error messages
 */
export const formatValidationError = (error: Joi.ValidationError) => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));

  return {
    status: 400,
    error: 'Validation Error',
    details: errors
  };
};