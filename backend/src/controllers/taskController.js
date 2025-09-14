const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    console.log('DEBUG: Creating task for user:', req.user.id);
    console.log('DEBUG: User type:', typeof req.user.id);

    // Add user to body
    req.body.user = req.user.id;
    console.log('DEBUG: Task data before creation:', req.body);

    // Create task
    const task = await Task.create(req.body);
    console.log('DEBUG: Task created with user field:', task.user);
    console.log('DEBUG: Task user type:', typeof task.user);

    // Populate user fields for response
    const populatedTask = await Task.findById(task._id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error('DEBUG: Error creating task:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all tasks with pagination
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Find tasks for logged in user (both created by user and assigned to user)
    console.log('DEBUG: getTasks - req.user.id:', req.user.id);
    console.log('DEBUG: getTasks - req.user._id:', req.user._id);

    const query = Task.find({
      $or: [
        { user: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    // Apply status filter if provided
    if (req.query.status) {
      query.where('status').equals(req.query.status);
    }

    // Apply priority filter if provided
    if (req.query.priority) {
      query.where('priority').equals(req.query.priority);
    }

    // Count total filtered tasks
    const filter = {
      $or: [
        { user: req.user.id },
        { assignedTo: req.user.id }
      ]
    };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    const total = await Task.countDocuments(filter);

    console.log('DEBUG: getTasks - Total tasks found:', total);

    // Pagination result
    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Execute query with pagination
    const tasks = await query.skip(startIndex).limit(limit);

    console.log('DEBUG: getTasks - Found tasks count:', tasks.length);
    if (tasks.length > 0) {
      console.log('DEBUG: getTasks - First task user field:', tasks[0].user);
      console.log('DEBUG: getTasks - First task user type:', typeof tasks[0].user);
    }

    res.status(200).json({
      success: true,
      count: total,
      pagination,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assigned tasks with pagination
// @route   GET /api/tasks/assigned
// @access  Private
exports.getAssignedTasks = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Find tasks assigned to logged in user
    const query = Task.find({ assignedTo: req.user.id })
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    // Apply status filter if provided
    if (req.query.status) {
      query.where('status').equals(req.query.status);
    }

    // Apply priority filter if provided
    if (req.query.priority) {
      query.where('priority').equals(req.query.priority);
    }

    // Count total filtered tasks
    const filter = { assignedTo: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    const total = await Task.countDocuments(filter);

    // Pagination result
    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Execute query with pagination
    const tasks = await query.skip(startIndex).limit(limit);

    res.status(200).json({
      success: true,
      count: total,
      pagination,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task or task is assigned to user
    console.log('DEBUG: task.user type:', typeof task.user);
    console.log('DEBUG: task.user:', task.user);
    console.log('DEBUG: task.user._id:', task.user._id);
    console.log('DEBUG: req.user.id:', req.user.id);
    console.log('DEBUG: req.user._id:', req.user._id);
    console.log('DEBUG: task.user._id.toString():', task.user._id.toString());
    console.log('DEBUG: req.user._id.toString():', req.user._id.toString());
    console.log('DEBUG: Comparison result (task.user._id vs req.user._id):', task.user._id.toString() !== req.user._id.toString());
    console.log('DEBUG: Comparison result (task.user._id vs req.user.id):', task.user._id.toString() !== req.user.id);

    // Try multiple comparison methods
    const isOwner = task.user._id.toString() === req.user._id.toString() ||
      task.user._id.toString() === req.user.id;
    const isAssigned = task.assignedTo && (
      task.assignedTo._id.toString() === req.user._id.toString() ||
      task.assignedTo._id.toString() === req.user.id
    );

    console.log('DEBUG: isOwner:', isOwner);
    console.log('DEBUG: isAssigned:', isAssigned);

    if (!isOwner && !isAssigned) {
      console.log('DEBUG: Authorization failed');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    console.log('DEBUG: Authorization passed');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task or is assigned to it
    if (task.user._id.toString() !== req.user.id &&
      task.assignedTo?._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email').populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task priority
// @route   PUT /api/tasks/:id/priority
// @access  Private
exports.updateTaskPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    // Check if priority is valid
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be low, medium, or high'
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task
    if (task.user._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Update task priority
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { priority },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Check if status is valid
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, in-progress, or completed'
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task or task is assigned to user
    if (task.user._id.toString() !== req.user.id &&
      task.assignedTo?._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Update task status
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Assign task to user
// @route   PUT /api/tasks/:id/assign
// @access  Private
exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task
    if (task.user._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to assign this task'
      });
    }

    // Update task with assigned user
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId },
      {
        new: true,
        runValidators: true
      }
    ).populate('user', 'name email').populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Make sure user owns the task or is assigned to it
    const isOwner = task.user._id.toString() === req.user.id;
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === req.user.id;
    
    if (!isOwner && !isAssigned) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};