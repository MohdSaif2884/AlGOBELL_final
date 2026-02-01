const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { protect } = require('../middleware/auth');

// @route   GET /api/problems
// @desc    Get all problems
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { difficulty, tag, search } = req.query;
    
    const query = { isActive: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(query)
      .select('title description difficulty tags stats')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        problems,
        count: problems.length
      }
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/problems/:id
// @desc    Get single problem
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { problem }
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/problems
// @desc    Create new problem
// @access  Private (Admin only - you can add admin middleware)
router.post('/', protect, async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      createdBy: req.user.id
    };

    const problem = await Problem.create(problemData);

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: { problem }
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update problem
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: { problem }
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/problems/random/:difficulty
// @desc    Get random problem by difficulty
// @access  Public
router.get('/random/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const problem = await Problem.getRandomByDifficulty(difficulty);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No problems found for this difficulty'
      });
    }

    res.status(200).json({
      success: true,
      data: { problem }
    });
  } catch (error) {
    console.error('Get random problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
