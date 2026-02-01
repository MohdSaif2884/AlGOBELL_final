const express = require('express');
const router = express.Router();
const reminderService = require('../services/reminderService');
const ApiResponse = require('../middleware/apiResponse');
const { protect } = require('../middleware/auth');
const config = require('../config');

/**
 * @route   GET /api/reminders
 * @desc    Get user's reminders
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    
    const reminders = await reminderService.getUserReminders(req.user._id, status);
    
    return ApiResponse.success(
      res,
      { reminders, count: reminders.length },
      'Reminders fetched successfully'
    );
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return ApiResponse.error(res, 'Failed to fetch reminders');
  }
});

/**
 * @route   DELETE /api/reminders/:id
 * @desc    Cancel a reminder
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await reminderService.cancelReminder(req.params.id, req.user._id);
    
    return ApiResponse.success(res, { reminder }, 'Reminder cancelled successfully');
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    return ApiResponse.error(res, error.message || 'Failed to cancel reminder');
  }
});

/**
 * @route   PUT /api/reminders/preferences
 * @desc    Update reminder preferences
 * @access  Private
 */
router.put('/preferences', protect, async (req, res) => {
  try {
    const { platforms, reminderOffsets, enabledChannels, whatsappNumber } = req.body;
    
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }
    
    // Update preferences
    if (platforms) {
      user.contestPreferences.platforms = platforms;
    }
    
    if (reminderOffsets) {
      user.contestPreferences.reminderOffsets = reminderOffsets;
    }
    
    if (enabledChannels) {
      user.contestPreferences.enabledChannels = {
        ...user.contestPreferences.enabledChannels,
        ...enabledChannels
      };
    }
    
    if (whatsappNumber !== undefined) {
      // Check if WhatsApp feature is enabled
      if (whatsappNumber && !config.features.whatsapp) {
        return ApiResponse.comingSoon(res, 'WhatsApp Reminders');
      }
      
      // Check if user has pro subscription
      if (whatsappNumber && !user.hasPro()) {
        return ApiResponse.error(
          res,
          'WhatsApp reminders require a Pro subscription',
          403
        );
      }
      
      user.contestPreferences.whatsappNumber = whatsappNumber;
    }
    
    await user.save();
    
    return ApiResponse.success(
      res,
      { preferences: user.contestPreferences },
      'Preferences updated successfully'
    );
  } catch (error) {
    console.error('Error updating preferences:', error);
    return ApiResponse.error(res, 'Failed to update preferences');
  }
});

/**
 * @route   GET /api/reminders/preferences
 * @desc    Get user's reminder preferences
 * @access  Private
 */
router.get('/preferences', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }
    
    return ApiResponse.success(
      res,
      { 
        preferences: user.contestPreferences,
        features: {
          whatsapp: config.features.whatsapp && user.hasPro(),
          customReminders: user.hasPro()
        }
      },
      'Preferences fetched successfully'
    );
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return ApiResponse.error(res, 'Failed to fetch preferences');
  }
});

module.exports = router;
