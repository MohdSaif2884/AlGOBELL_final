const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Code Battle'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    ready: {
      type: Boolean,
      default: false
    },
    submission: {
      code: String,
      language: String,
      submittedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'wrong', 'error'],
        default: 'pending'
      },
      executionTime: Number,
      memory: Number
    }
  }],
  maxPlayers: {
    type: Number,
    default: 2,
    min: 2,
    max: 10
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 600000 // 10 minutes in milliseconds
  },
  winner: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    timeTaken: Number,
    wonAt: Date
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String
  },
  settings: {
    allowSpectators: {
      type: Boolean,
      default: true
    },
    showLeaderboard: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'cpp', 'java', 'any'],
      default: 'any'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
battleSchema.index({ status: 1, createdAt: -1 });
battleSchema.index({ 'players.user': 1 });

// Virtual for time remaining
battleSchema.virtual('timeRemaining').get(function() {
  if (!this.startTime) return this.duration;
  const elapsed = Date.now() - this.startTime.getTime();
  return Math.max(0, this.duration - elapsed);
});

// Method to check if battle is full
battleSchema.methods.isFull = function() {
  return this.players.length >= this.maxPlayers;
};

// Method to add player
battleSchema.methods.addPlayer = function(userId, username) {
  if (this.isFull()) {
    throw new Error('Battle is full');
  }
  
  const alreadyJoined = this.players.some(p => p.user.toString() === userId.toString());
  if (alreadyJoined) {
    throw new Error('Player already in battle');
  }

  this.players.push({
    user: userId,
    username: username,
    joinedAt: new Date()
  });
};

// Method to start battle
battleSchema.methods.startBattle = function() {
  if (this.status !== 'waiting') {
    throw new Error('Battle already started or completed');
  }
  
  const allReady = this.players.every(p => p.ready);
  if (!allReady) {
    throw new Error('Not all players are ready');
  }

  this.status = 'in-progress';
  this.startTime = new Date();
  this.endTime = new Date(Date.now() + this.duration);
};

// Method to end battle
battleSchema.methods.endBattle = function(winnerId, winnerUsername, timeTaken) {
  this.status = 'completed';
  this.winner = {
    user: winnerId,
    username: winnerUsername,
    timeTaken: timeTaken,
    wonAt: new Date()
  };
  this.endTime = new Date();
};

module.exports = mongoose.model('Battle', battleSchema);
