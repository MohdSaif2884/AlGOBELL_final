const Reminder = require('../models/Reminder');
const Contest = require('../models/Contest');
const User = require('../models/User');
const config = require('../config');

class ReminderService {
  /**
   * Create reminders for a user and contest
   */
  async createReminders(userId, contestId, customOffsets = null) {
    try {
      const contest = await Contest.findById(contestId);
      if (!contest) {
        throw new Error('Contest not found');
      }
      
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Use custom offsets or user preferences or default
      const offsets = customOffsets || 
                     user.contestPreferences.reminderOffsets || 
                     config.reminders.offsets;
      
      const reminders = [];
      
      for (const offsetMinutes of offsets) {
        // Calculate scheduled time (contest start - offset)
        const scheduledAt = new Date(contest.startTime);
        scheduledAt.setMinutes(scheduledAt.getMinutes() - offsetMinutes);
        
        // Don't create reminders for past times
        if (scheduledAt <= new Date()) {
          continue;
        }
        
        // Determine which channels to use
        const channels = {
          email: user.contestPreferences.enabledChannels.email,
          whatsapp: user.contestPreferences.enabledChannels.whatsapp && 
                   config.features.whatsapp &&
                   user.hasPro(),
          push: user.contestPreferences.enabledChannels.push
        };
        
        // Only create reminder if at least one channel is enabled
        if (!channels.email && !channels.whatsapp && !channels.push) {
          continue;
        }
        
        // Create or update reminder
        const reminder = await Reminder.findOneAndUpdate(
          {
            userId,
            contestId,
            offsetMinutes
          },
          {
            scheduledAt,
            channels,
            status: 'pending'
          },
          {
            upsert: true,
            new: true
          }
        );
        
        reminders.push(reminder);
      }
      
      console.log(`✅ Created ${reminders.length} reminders for user ${userId}`);
      return reminders;
    } catch (error) {
      console.error('❌ Error creating reminders:', error);
      throw error;
    }
  }
  
  /**
   * Check for pending reminders and send them
   */
  async checkAndSendReminders() {
    try {
      const now = new Date();
      
      // Find reminders that should be sent
      const pendingReminders = await Reminder.find({
        status: 'pending',
        scheduledAt: { $lte: now }
      })
      .populate('userId')
      .populate('contestId')
      .limit(100); // Process in batches
      
      if (pendingReminders.length === 0) {
        return { sent: 0, failed: 0 };
      }
      
      console.log(`📤 Processing ${pendingReminders.length} pending reminders...`);
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (const reminder of pendingReminders) {
        try {
          await this.sendReminder(reminder);
          await reminder.markSent();
          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder ${reminder._id}:`, error.message);
          await reminder.markFailed(error.message);
          failedCount++;
        }
      }
      
      console.log(`✅ Sent ${sentCount} reminders, ${failedCount} failed`);
      
      return { sent: sentCount, failed: failedCount };
    } catch (error) {
      console.error('❌ Error checking reminders:', error);
      throw error;
    }
  }
  
  /**
   * Send a reminder through configured channels
   */
  async sendReminder(reminder) {
    const { userId, contestId, channels, offsetMinutes } = reminder;
    
    if (!userId || !contestId) {
      throw new Error('Invalid reminder data');
    }
    
    const contest = contestId;
    const user = userId;
    
    // Format reminder message
    const timeText = offsetMinutes >= 60 
      ? `${Math.floor(offsetMinutes / 60)} hour(s)`
      : `${offsetMinutes} minutes`;
    
    const message = {
      title: `Contest Reminder: ${contest.name}`,
      body: `${contest.name} on ${contest.platform} starts in ${timeText}!`,
      url: contest.url,
      contestName: contest.name,
      platform: contest.platform,
      startTime: contest.startTime,
      offsetMinutes
    };
    
    const results = [];
    
    // Send via email
    if (channels.email) {
      try {
        await this.sendEmailReminder(user.email, message);
        results.push({ channel: 'email', status: 'sent' });
      } catch (error) {
        results.push({ channel: 'email', status: 'failed', error: error.message });
      }
    }
    
    // Send via WhatsApp (if feature enabled and user has pro)
    if (channels.whatsapp && config.features.whatsapp) {
      try {
        await this.sendWhatsAppReminder(user.contestPreferences.whatsappNumber, message);
        results.push({ channel: 'whatsapp', status: 'sent' });
      } catch (error) {
        results.push({ channel: 'whatsapp', status: 'failed', error: error.message });
      }
    }
    
    // Send via push notification
    if (channels.push) {
      try {
        await this.sendPushNotification(user._id, message);
        results.push({ channel: 'push', status: 'sent' });
      } catch (error) {
        results.push({ channel: 'push', status: 'failed', error: error.message });
      }
    }
    
    return results;
  }
  
  /**
   * Send email reminder (placeholder - implement with your email service)
   */
  async sendEmailReminder(email, message) {
    // TODO: Implement with nodemailer, SendGrid, or your email service
    console.log(`📧 [Email] Sending to ${email}: ${message.title}`);
    
    // For now, just log. In production, integrate with email service:
    // const nodemailer = require('nodemailer');
    // await transporter.sendMail({ ... });
    
    return true;
  }
  
  /**
   * Send WhatsApp reminder via Twilio
   */
  async sendWhatsAppReminder(phoneNumber, message) {
    if (!config.features.whatsapp) {
      throw new Error('WhatsApp feature is disabled');
    }
    
    // TODO: Implement with Twilio WhatsApp API
    console.log(`📱 [WhatsApp] Sending to ${phoneNumber}: ${message.title}`);
    
    // For production:
    // const twilio = require('twilio');
    // const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    // await client.messages.create({ ... });
    
    return true;
  }
  
  /**
   * Send push notification
   */
  async sendPushNotification(userId, message) {
    // TODO: Implement with Firebase Cloud Messaging or your push service
    console.log(`🔔 [Push] Sending to user ${userId}: ${message.title}`);
    
    // For production, integrate with FCM or similar:
    // const admin = require('firebase-admin');
    // await admin.messaging().send({ ... });
    
    return true;
  }
  
  /**
   * Get user's reminders
   */
  async getUserReminders(userId, status = null) {
    const query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    return Reminder.find(query)
      .populate('contestId')
      .sort({ scheduledAt: 1 })
      .lean();
  }
  
  /**
   * Cancel a reminder
   */
  async cancelReminder(reminderId, userId) {
    const reminder = await Reminder.findOne({ _id: reminderId, userId });
    
    if (!reminder) {
      throw new Error('Reminder not found');
    }
    
    if (reminder.status !== 'pending') {
      throw new Error('Can only cancel pending reminders');
    }
    
    reminder.status = 'cancelled';
    await reminder.save();
    
    return reminder;
  }
  
  /**
   * Clean up old reminders (older than 30 days)
   */
  async cleanupOldReminders() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const result = await Reminder.deleteMany({
      status: { $in: ['sent', 'failed', 'cancelled'] },
      scheduledAt: { $lt: cutoffDate }
    });
    
    console.log(`🗑️  Cleaned up ${result.deletedCount} old reminders`);
    return result.deletedCount;
  }
}

module.exports = new ReminderService();
