const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
    index: true
  },
  
  // Reminder offset in minutes (e.g., 60 = 1 hour before)
  offsetMinutes: {
    type: Number,
    required: true
  },
  
  // Scheduled time for this reminder (calculated from contest start - offset)
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Reminder delivery channels
  channels: {
    email: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  // Delivery status
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Delivery tracking
  sentAt: Date,

  failureReason: String,

  attempts: {
    type: Number,
    default: 0
  },

  maxAttempts: {
    type: Number,
    default: 3
  },

  // Reminder type (for smart platform alarms)
  type: {
    type: String,
    enum: ['manual', 'smart'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index for efficient reminder queries
reminderSchema.index({ scheduledAt: 1, status: 1 });
reminderSchema.index({ userId: 1, contestId: 1, offsetMinutes: 1 }, { unique: true });

// Mark reminder as sent
reminderSchema.methods.markSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Mark reminder as failed
reminderSchema.methods.markFailed = function(reason) {
  this.attempts += 1;
  
  if (this.attempts >= this.maxAttempts) {
    this.status = 'failed';
    this.failureReason = reason;
  }
  
  return this.save();
};

// Check if reminder should be sent
reminderSchema.methods.shouldSend = function() {
  const now = new Date();
  return this.status === 'pending' && 
         this.scheduledAt <= now && 
         this.attempts < this.maxAttempts;
};

module.exports = mongoose.model('Reminder', reminderSchema);
