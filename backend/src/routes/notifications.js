const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const {
  validateCreateNotification,
  validateUpdateNotification,
  validateQueryParams,
  validateMongoId
} = require('../validators/notificationValidator');

// Create notification
router.post('/', 
  validateCreateNotification,
  notificationController.create
);

// Get notifications for a user with pagination and filtering
router.get('/user/:userId',
  validateMongoId('userId'),
  validateQueryParams,
  notificationController.getByUser
);

// Get notification statistics for a user
router.get('/user/:userId/stats',
  validateMongoId('userId'),
  notificationController.getStats
);

// Mark all notifications as read for a user
router.patch('/user/:userId/mark-all-read',
  validateMongoId('userId'),
  notificationController.markAllAsRead
);

// Get single notification by ID
router.get('/:id',
  validateMongoId(),
  notificationController.getById
);

// Update notification
router.patch('/:id',
  validateMongoId(),
  validateUpdateNotification,
  notificationController.update
);

// Mark notification as read
router.patch('/:id/read',
  validateMongoId(),
  notificationController.markAsRead
);

// Mark notification as unread
router.patch('/:id/unread',
  validateMongoId(),
  notificationController.markAsUnread
);

// Soft delete notification
router.delete('/:id',
  validateMongoId(),
  notificationController.delete
);

// Hard delete notification (permanent) - admin only
router.delete('/:id/permanent',
  validateMongoId(),
  notificationController.hardDelete
);

module.exports = router;