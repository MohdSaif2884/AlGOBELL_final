const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Battle = require('../models/Battle');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/battles/create
// @desc    Create new battle
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const {
      title,
      problemId,
      maxPlayers,
      duration,
      isPrivate,
      password,
      difficulty
    } = req.body;

    // Get problem or select random one
    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
    } else if (difficulty) {
      problem = await Problem.getRandomByDifficulty(difficulty);
    } else {
      problem = await Problem.getRandomByDifficulty('medium');
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Generate unique room ID
    const roomId = uuidv4().substring(0, 8);

    // Create battle
    const battle = await Battle.create({
      roomId,
      title: title || `Battle - ${problem.title}`,
      creator: req.user.id,
      problem: problem._id,
      maxPlayers: maxPlayers || 2,
      duration: duration || 600000,
      isPrivate: isPrivate || false,
      password: password || null,
      players: [{
        user: req.user.id,
        username: req.user.username,
        ready: false
      }]
    });

    await battle.populate('problem');

    res.status(201).json({
      success: true,
      message: 'Battle created successfully',
      data: {
        battle: {
          id: battle._id,
          roomId: battle.roomId,
          title: battle.title,
          problem: {
            id: problem._id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            examples: problem.examples,
            starterCode: problem.starterCode
          },
          maxPlayers: battle.maxPlayers,
          currentPlayers: battle.players.length,
          status: battle.status,
          isPrivate: battle.isPrivate
        }
      }
    });
  } catch (error) {
    console.error('Create battle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/battles
// @desc    Get all active battles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, difficulty } = req.query;
    
    const query = { isPrivate: false };
    if (status) query.status = status;

    const battles = await Battle.find(query)
      .populate('creator', 'username avatar')
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        battles: battles.map(b => ({
          id: b._id,
          roomId: b.roomId,
          title: b.title,
          creator: b.creator,
          problem: b.problem,
          currentPlayers: b.players.length,
          maxPlayers: b.maxPlayers,
          status: b.status,
          createdAt: b.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/battles/:roomId
// @desc    Get battle by room ID
// @access  Public
router.get('/:roomId', async (req, res) => {
  try {
    const battle = await Battle.findOne({ roomId: req.params.roomId })
      .populate('creator', 'username avatar')
      .populate('problem')
      .populate('players.user', 'username avatar');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        battle: {
          id: battle._id,
          roomId: battle.roomId,
          title: battle.title,
          creator: battle.creator,
          problem: battle.problem,
          players: battle.players,
          maxPlayers: battle.maxPlayers,
          status: battle.status,
          startTime: battle.startTime,
          endTime: battle.endTime,
          duration: battle.duration,
          winner: battle.winner,
          settings: battle.settings
        }
      }
    });
  } catch (error) {
    console.error('Get battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/battles/:roomId/join
// @desc    Join a battle
// @access  Private
router.post('/:roomId/join', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const battle = await Battle.findOne({ roomId: req.params.roomId })
      .populate('problem');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if battle is full
    if (battle.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Battle is full'
      });
    }

    // Check if already in battle
    const alreadyJoined = battle.players.some(
      p => p.user.toString() === req.user.id.toString()
    );
    
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'Already in this battle'
      });
    }

    // Check password for private battles
    if (battle.isPrivate && battle.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Add player
    battle.addPlayer(req.user.id, req.user.username);
    await battle.save();

    res.status(200).json({
      success: true,
      message: 'Joined battle successfully',
      data: {
        battle: {
          roomId: battle.roomId,
          problem: battle.problem
        }
      }
    });
  } catch (error) {
    console.error('Join battle error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/battles/:roomId/ready
// @desc    Mark player as ready
// @access  Private
router.put('/:roomId/ready', protect, async (req, res) => {
  try {
    const battle = await Battle.findOne({ roomId: req.params.roomId });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    const player = battle.players.find(
      p => p.user.toString() === req.user.id.toString()
    );

    if (!player) {
      return res.status(400).json({
        success: false,
        message: 'Not in this battle'
      });
    }

    player.ready = true;
    await battle.save();

    res.status(200).json({
      success: true,
      message: 'Marked as ready'
    });
  } catch (error) {
    console.error('Ready error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/battles/user/history
// @desc    Get user's battle history
// @access  Private
router.get('/user/history', protect, async (req, res) => {
  try {
    const battles = await Battle.find({
      'players.user': req.user.id
    })
      .populate('problem', 'title difficulty')
      .populate('winner.user', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        battles: battles.map(b => ({
          id: b._id,
          roomId: b.roomId,
          title: b.title,
          problem: b.problem,
          status: b.status,
          winner: b.winner,
          isWinner: b.winner?.user?._id.toString() === req.user.id.toString(),
          createdAt: b.createdAt,
          completedAt: b.endTime
        }))
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
