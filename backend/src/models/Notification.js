const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true // Index for better query performance
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true // Index for filtering read/unread notifications
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true // Index for soft delete queries
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound indexes for better query performance
notificationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, isDeleted: 1 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Instance method for soft delete
notificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    userId, 
    isRead: false, 
    isDeleted: false 
  });
};

// Static method to get notifications with pagination
notificationSchema.statics.getPaginated = function(userId, page = 1, limit = 10, includeRead = true) {
  const skip = (page - 1) * limit;
  const query = { 
    userId, 
    isDeleted: false 
  };
  
  if (!includeRead) {
    query.isRead = false;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 }) // Most recent first
    .skip(skip)
    .limit(limit)
    .lean(); // Return plain JavaScript objects for better performance
};

// Pre-save middleware to ensure UTF-8 and set deletedAt when isDeleted is true
notificationSchema.pre('save', function(next) {
  // Ensure UTF-8 encoding for text fields
  if (this.title && typeof this.title === 'string') {
    this.title = Buffer.from(this.title, 'utf8').toString('utf8');
  }
  if (this.message && typeof this.message === 'string') {
    this.message = Buffer.from(this.message, 'utf8').toString('utf8');
  }
  
  if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  next();
});

// Virtual for formatted creation date
notificationSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toISOString();
});

// Ensure virtuals are included when converting to JSON with UTF-8 support
notificationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    
    // Ensure UTF-8 encoding in JSON output
    if (ret.title && typeof ret.title === 'string') {
      ret.title = Buffer.from(ret.title, 'utf8').toString('utf8');
    }
    if (ret.message && typeof ret.message === 'string') {
      ret.message = Buffer.from(ret.message, 'utf8').toString('utf8');
    }
    
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;