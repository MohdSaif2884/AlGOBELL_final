const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed='
  },
  
  // Contest preferences
  contestPreferences: {
    platforms: {
      type: [String],
      default: ['codeforces', 'leetcode', 'codechef', 'atcoder']
    },
    reminderOffsets: {
      type: [Number], // Minutes before contest
      default: [60, 30, 15] // 1hr, 30min, 15min
    },
    enabledChannels: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    whatsappNumber: {
      type: String,
      default: ''
    }
  },
  
  // Battle stats
  stats: {
    battlesPlayed: {
      type: Number,
      default: 0
    },
    battlesWon: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    }
  },
  
  achievements: [{
    title: String,
    description: String,
    earnedAt: Date,
    icon: String
  }],
  
  // Subscription info
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    expiresAt: Date,
    features: {
      whatsappReminders: { type: Boolean, default: false },
      customReminders: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false }
    }
  },

  // Smart Platform Alarm (PRO feature)
  smartAlarm: {
    enabled: { type: Boolean, default: false },
    platform: { type: String, default: null },
    offsetMinutes: { type: Number, default: 30 }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update avatar with username seed
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.username}`;
  }
  next();
});

// Calculate win rate
userSchema.methods.updateWinRate = function() {
  if (this.stats.battlesPlayed > 0) {
    this.stats.winRate = (this.stats.battlesWon / this.stats.battlesPlayed) * 100;
  }
};

// Check if user has pro features
userSchema.methods.hasPro = function() {
  return this.subscription.plan === 'pro' && 
         (!this.subscription.expiresAt || this.subscription.expiresAt > new Date());
};

module.exports = mongoose.model('User', userSchema);
