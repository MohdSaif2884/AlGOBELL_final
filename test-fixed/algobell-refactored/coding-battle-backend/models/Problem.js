const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 10
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  constraints: {
    type: String
  },
  inputFormat: {
    type: String
  },
  outputFormat: {
    type: String
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String
  },
  solution: {
    javascript: String,
    python: String,
    cpp: String,
    java: String
  },
  timeLimit: {
    type: Number,
    default: 2000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    successfulAttempts: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searches
problemSchema.index({ difficulty: 1, tags: 1 });
problemSchema.index({ isActive: 1 });

// Update success rate
problemSchema.methods.updateSuccessRate = function() {
  if (this.stats.totalAttempts > 0) {
    this.stats.successRate = (this.stats.successfulAttempts / this.stats.totalAttempts) * 100;
  }
};

// Get random problem by difficulty
problemSchema.statics.getRandomByDifficulty = async function(difficulty) {
  const count = await this.countDocuments({ difficulty, isActive: true });
  const random = Math.floor(Math.random() * count);
  return this.findOne({ difficulty, isActive: true }).skip(random);
};

module.exports = mongoose.model('Problem', problemSchema);
