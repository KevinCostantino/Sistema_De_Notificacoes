const Notification = require('../models/Notification');
const { correctTextWithCache } = require('../middleware/textCorrectionMiddleware');

class NotificationController {
  
  // Create a new notification
  async create(req, res, next) {
    try {
      // Aplica correção UTF-8 nos campos de texto antes de salvar
      const correctedData = { ...req.body };
      
      if (correctedData.title) {
        correctedData.title = await correctTextWithCache(correctedData.title);
      }
      
      if (correctedData.message) {
        correctedData.message = await correctTextWithCache(correctedData.message);
      }
      
      const notification = new Notification(correctedData);
      const savedNotification = await notification.save();
      
      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: savedNotification
      });
    } catch (error) {
      next(error);
    }
  }

  // Get notifications for a user with pagination
  async getByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { page, limit, includeRead, type, priority, isRead } = req.query;

      // Build filter query
      const filter = { 
        userId, 
        isDeleted: false 
      };

      if (type) filter.type = type;
      if (priority) filter.priority = priority;
      if (typeof isRead !== 'undefined') filter.isRead = isRead;
      if (!includeRead) filter.isRead = false;

      // Get total count for pagination
      const total = await Notification.countDocuments(filter);
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Get notifications
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get unread count
      const unreadCount = await Notification.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        },
        meta: {
          unreadCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a single notification by ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOne({
        _id: id,
        isDeleted: false
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOne({
        _id: id,
        isDeleted: false
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      if (notification.isRead) {
        return res.status(200).json({
          success: true,
          message: 'Notification is already marked as read',
          data: notification
        });
      }

      await notification.markAsRead();

      res.status(200).json({
        success: true,
        message: 'Notification marked as read successfully',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark notification as unread
  async markAsUnread(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOne({
        _id: id,
        isDeleted: false
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      notification.isRead = false;
      await notification.save();

      res.status(200).json({
        success: true,
        message: 'Notification marked as unread successfully',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(req, res, next) {
    try {
      const { userId } = req.params;
      
      const result = await Notification.updateMany(
        { 
          userId, 
          isRead: false, 
          isDeleted: false 
        },
        { 
          isRead: true 
        }
      );

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`,
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update notification
  async update(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification updated successfully',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  // Soft delete notification
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOne({
        _id: id,
        isDeleted: false
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      await notification.softDelete();

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Hard delete notification (permanent)
  async hardDelete(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByIdAndDelete(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification permanently deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get notification statistics for a user
  async getStats(req, res, next) {
    try {
      const { userId } = req.params;

      // Get basic counts
      const [total, unread, read] = await Promise.all([
        Notification.countDocuments({ userId, isDeleted: false }),
        Notification.countDocuments({ userId, isDeleted: false, isRead: false }),
        Notification.countDocuments({ userId, isDeleted: false, isRead: true })
      ]);

      // Get stats by type
      const typeStats = await Notification.aggregate([
        { $match: { userId, isDeleted: false } },
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
          }
        }
      ]);

      // Get stats by priority
      const priorityStats = await Notification.aggregate([
        { $match: { userId, isDeleted: false } },
        {
          $group: {
            _id: '$priority',
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
          }
        }
      ]);

      // Format the results
      const byType = {};
      typeStats.forEach(stat => {
        byType[stat._id] = {
          total: stat.total,
          unread: stat.unread
        };
      });

      const byPriority = {};
      priorityStats.forEach(stat => {
        byPriority[stat._id] = {
          total: stat.total,
          unread: stat.unread
        };
      });

      const result = {
        total,
        unread,
        read,
        byType,
        byPriority
      };

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();