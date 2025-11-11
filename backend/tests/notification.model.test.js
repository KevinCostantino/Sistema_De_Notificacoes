const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Notification = require('../src/models/Notification');

describe('Notification Model', () => {
  let mongoServer;
  let testUserId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    testUserId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  describe('Model Validation', () => {
    it('should create a valid notification', async () => {
      const notificationData = {
        userId: testUserId,
        title: 'Test Notification',
        message: 'This is a test message',
        type: 'info',
        priority: 'medium'
      };

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      expect(savedNotification.userId).toBe(testUserId);
      expect(savedNotification.title).toBe('Test Notification');
      expect(savedNotification.message).toBe('This is a test message');
      expect(savedNotification.type).toBe('info');
      expect(savedNotification.priority).toBe('medium');
      expect(savedNotification.isRead).toBe(false);
      expect(savedNotification.isDeleted).toBe(false);
      expect(savedNotification.createdAt).toBeDefined();
      expect(savedNotification.updatedAt).toBeDefined();
    });

    it('should fail validation without required fields', async () => {
      const notification = new Notification({});
      
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail validation with invalid type', async () => {
      const notification = new Notification({
        userId: testUserId,
        title: 'Test',
        message: 'Test message',
        type: 'invalid-type'
      });
      
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail validation with title too long', async () => {
      const notification = new Notification({
        userId: testUserId,
        title: 'A'.repeat(201), // Exceeds 200 character limit
        message: 'Test message'
      });
      
      await expect(notification.save()).rejects.toThrow();
    });

    it('should fail validation with message too long', async () => {
      const notification = new Notification({
        userId: testUserId,
        title: 'Test',
        message: 'A'.repeat(1001) // Exceeds 1000 character limit
      });
      
      await expect(notification.save()).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let notification;

    beforeEach(async () => {
      const notificationData = {
        userId: testUserId,
        title: 'Test Notification',
        message: 'Test message',
        isRead: false
      };

      notification = await Notification.create(notificationData);
    });

    it('should mark notification as read', async () => {
      expect(notification.isRead).toBe(false);
      
      await notification.markAsRead();
      
      expect(notification.isRead).toBe(true);
      
      // Verify in database
      const updatedNotification = await Notification.findById(notification._id);
      expect(updatedNotification.isRead).toBe(true);
    });

    it('should soft delete notification', async () => {
      expect(notification.isDeleted).toBe(false);
      expect(notification.deletedAt).toBeNull();
      
      await notification.softDelete();
      
      expect(notification.isDeleted).toBe(true);
      expect(notification.deletedAt).toBeDefined();
      
      // Verify in database
      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification.isDeleted).toBe(true);
      expect(deletedNotification.deletedAt).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
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
          isRead: true
        },
        {
          userId: testUserId,
          title: 'Notification 3',
          message: 'Message 3',
          isRead: false
        }
      ];

      await Notification.insertMany(notifications);
    });

    it('should get unread count for user', async () => {
      const unreadCount = await Notification.getUnreadCount(testUserId);
      expect(unreadCount).toBe(2);
    });

    it('should get paginated notifications', async () => {
      const notifications = await Notification.getPaginated(testUserId, 1, 2);
      expect(notifications).toHaveLength(2);
      expect(notifications[0].createdAt).toBeDefined();
    });

    it('should get only unread notifications when includeRead is false', async () => {
      const notifications = await Notification.getPaginated(testUserId, 1, 10, false);
      expect(notifications).toHaveLength(2);
      notifications.forEach(notification => {
        expect(notification.isRead).toBe(false);
      });
    });
  });

  describe('Pre-save Middleware', () => {
    it('should set deletedAt when isDeleted is set to true', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        title: 'Test',
        message: 'Test message'
      });

      expect(notification.deletedAt).toBeNull();

      notification.isDeleted = true;
      await notification.save();

      expect(notification.deletedAt).toBeDefined();
      expect(notification.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Virtuals', () => {
    it('should include formattedCreatedAt virtual', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        title: 'Test',
        message: 'Test message'
      });

      const notificationObj = notification.toJSON();
      expect(notificationObj.formattedCreatedAt).toBeDefined();
      expect(typeof notificationObj.formattedCreatedAt).toBe('string');
      expect(notificationObj.formattedCreatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should exclude __v from JSON', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        title: 'Test',
        message: 'Test message'
      });

      const notificationObj = notification.toJSON();
      expect(notificationObj.__v).toBeUndefined();
    });
  });
});