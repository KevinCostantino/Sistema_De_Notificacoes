const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Notification = require('../src/models/Notification');

describe('Notification API', () => {
  let mongoServer;
  let testUserId;

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    // Generate a test user ID
    testUserId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    // Close database connection and stop MongoDB instance
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Notification.deleteMany({});
  });

  describe('POST /api/notifications', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        userId: testUserId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification created successfully');
      expect(response.body.data.title).toBe(notificationData.title);
      expect(response.body.data.message).toBe(notificationData.message);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.isRead).toBe(false);
    });

    it('should fail to create notification without required fields', async () => {
      const invalidData = {
        title: 'Test Notification'
        // Missing userId and message
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.details).toContain('User ID is required');
      expect(response.body.details).toContain('Message is required');
    });

    it('should fail with invalid notification type', async () => {
      const invalidData = {
        userId: testUserId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'invalid-type'
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('GET /api/notifications/user/:userId', () => {
    beforeEach(async () => {
      // Create test notifications
      const notifications = [
        {
          userId: testUserId,
          title: 'Notification 1',
          message: 'Message 1',
          type: 'info',
          isRead: false
        },
        {
          userId: testUserId,
          title: 'Notification 2',
          message: 'Message 2',
          type: 'warning',
          isRead: true
        },
        {
          userId: testUserId,
          title: 'Notification 3',
          message: 'Message 3',
          type: 'error',
          isRead: false
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should get paginated notifications for a user', async () => {
      const response = await request(app)
        .get(`/api/notifications/user/${testUserId}?page=1&limit=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalItems).toBe(3);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.meta.unreadCount).toBe(2);
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get(`/api/notifications/user/${testUserId}?includeRead=false`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach(notification => {
        expect(notification.isRead).toBe(false);
      });
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get(`/api/notifications/user/${testUserId}?type=warning`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('warning');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await Notification.create({
        userId: testUserId,
        title: 'Test Notification',
        message: 'Test message',
        isRead: false
      });
      notificationId = notification._id.toString();
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification marked as read successfully');
      expect(response.body.data.isRead).toBe(true);

      // Verify in database
      const updatedNotification = await Notification.findById(notificationId);
      expect(updatedNotification.isRead).toBe(true);
    });

    it('should handle already read notification', async () => {
      // First mark as read
      await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .expect(200);

      // Try to mark as read again
      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification is already marked as read');
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .patch(`/api/notifications/${fakeId}/read`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .patch('/api/notifications/invalid-id/read')
        .expect(400);

      expect(response.body.error).toBe('Invalid ID');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let notificationId;

    beforeEach(async () => {
      const notification = await Notification.create({
        userId: testUserId,
        title: 'Test Notification',
        message: 'Test message'
      });
      notificationId = notification._id.toString();
    });

    it('should soft delete notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification deleted successfully');

      // Verify soft delete in database
      const deletedNotification = await Notification.findById(notificationId);
      expect(deletedNotification.isDeleted).toBe(true);
      expect(deletedNotification.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`/api/notifications/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('PATCH /api/notifications/user/:userId/mark-all-read', () => {
    beforeEach(async () => {
      // Create multiple unread notifications
      const notifications = [
        {
          userId: testUserId,
          title: 'Notification 1',
          message: 'Message 1',
          isRead: false
        },
        {
          userId: testUserId,
          title: 'Notification 2',
          message: 'Message 2',
          isRead: false
        },
        {
          userId: testUserId,
          title: 'Notification 3',
          message: 'Message 3',
          isRead: true // Already read
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should mark all unread notifications as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/user/${testUserId}/mark-all-read`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('2 notifications marked as read');
      expect(response.body.data.modifiedCount).toBe(2);

      // Verify all notifications are now read
      const unreadCount = await Notification.countDocuments({
        userId: testUserId,
        isRead: false,
        isDeleted: false
      });
      expect(unreadCount).toBe(0);
    });
  });

  describe('GET /api/notifications/user/:userId/stats', () => {
    beforeEach(async () => {
      const notifications = [
        {
          userId: testUserId,
          title: 'Info Notification',
          message: 'Info message',
          type: 'info',
          priority: 'low',
          isRead: false
        },
        {
          userId: testUserId,
          title: 'Warning Notification',
          message: 'Warning message',
          type: 'warning',
          priority: 'high',
          isRead: true
        },
        {
          userId: testUserId,
          title: 'Error Notification',
          message: 'Error message',
          type: 'error',
          priority: 'high',
          isRead: false
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should return notification statistics', async () => {
      const response = await request(app)
        .get(`/api/notifications/user/${testUserId}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.unread).toBe(2);
      expect(response.body.data.read).toBe(1);
    });
  });
});