const Joi = require('joi');

// Validation schemas
const schemas = {
  createNotification: Joi.object({
    userId: Joi.string().required().messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
    title: Joi.string().max(200).required().messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
    message: Joi.string().max(1000).required().messages({
      'string.empty': 'Message is required',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    }),
    type: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    metadata: Joi.object().default({})
  }),

  updateNotification: Joi.object({
    title: Joi.string().max(200).messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
    message: Joi.string().max(1000).messages({
      'string.max': 'Message cannot exceed 1000 characters'
    }),
    type: Joi.string().valid('info', 'warning', 'error', 'success'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    metadata: Joi.object()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  queryParams: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    includeRead: Joi.boolean().default(true),
    type: Joi.string().valid('info', 'warning', 'error', 'success'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    isRead: Joi.boolean()
  }),

  mongoId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
  })
};

// Validation middleware factory
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
const validateCreateNotification = validateRequest(schemas.createNotification);
const validateUpdateNotification = validateRequest(schemas.updateNotification);
const validateQueryParams = validateRequest(schemas.queryParams, 'query');
const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const { error } = schemas.mongoId.validate(req.params[paramName]);
    if (error) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid resource ID format'
      });
    }
    next();
  };
};

module.exports = {
  schemas,
  validateRequest,
  validateCreateNotification,
  validateUpdateNotification,
  validateQueryParams,
  validateMongoId
};