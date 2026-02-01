const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Battle = require('../models/Battle');

// @route   GET /api/leaderboard
// @desc    Get global leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 100, sortBy = 'totalScore' } = req.query;

    const sortOptions = {
      totalScore: { 'stats.totalScore': -1 },
      winRate: { 'stats.winRate': -1 },
      battlesWon: { 'stats.battlesWon': -1 },
      battlesPlayed: { 'stats.battlesPlayed': -1 }
    };

    const users = await User.find()
      .select('username avatar stats')
      .sort(sortOptions[sortBy] || sortOptions.totalScore)
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      avatar: user.avatar,
      stats: user.stats
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        count: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaderboard/top/:count
// @desc    Get top N users
// @access  Public
router.get('/top/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;

    const users = await User.find()
      .select('username avatar stats')
      .sort({ 'stats.totalScore': -1 })
      .limit(count);

    const topUsers = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      avatar: user.avatar,
      totalScore: user.stats.totalScore,
      battlesWon: user.stats.battlesWon,
      winRate: user.stats.winRate
    }));

    res.status(200).json({
      success: true,
      data: { topUsers }
    });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user rank and stats
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username avatar stats');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate rank
    const rank = await User.countDocuments({
      'stats.totalScore': { $gt: user.stats.totalScore }
    }) + 1;

    res.status(200).json({
      success: true,
      data: {
        rank,
        user: {
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          stats: user.stats
        }
      }
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaderboard/recent-winners
// @desc    Get recent battle winners
// @access  Public
router.get('/recent-winners', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const battles = await Battle.find({
      status: 'completed',
      winner: { $ne: null }
    })
      .select('winner problem createdAt')
      .populate('winner.user', 'username avatar')
      .populate('problem', 'title difficulty')
      .sort({ 'winner.wonAt': -1 })
      .limit(parseInt(limit));

    const recentWinners = battles.map(b => ({
      battleId: b._id,
      winner: {
        userId: b.winner.user._id,
        username: b.winner.user.username,
        avatar: b.winner.user.avatar,
        timeTaken: b.winner.timeTaken
      },
      problem: b.problem,
      wonAt: b.winner.wonAt
    }));

    res.status(200).json({
      success: true,
      data: { recentWinners }
    });
  } catch (error) {
    console.error('Get recent winners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
