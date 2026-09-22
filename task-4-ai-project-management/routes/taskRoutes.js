const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/project");
const auth = require("../middleware/auth");

const router = express.Router();

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project,
      assignedTo
    } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        message: "Title and project are required"
      });
    }

    const projectExists = await Project.findOne({
      _id: project,
      owner: req.user.id
    });

    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assignedTo
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message
    });
  }
});

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user.id
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    const tasks = await Task.find({
      project: { $in: projectIds }
    })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});

// Get single task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findOne({
      _id: task.project._id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message
    });
  }
});

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project,
      assignedTo
    } = req.body;

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const existingProject = await Project.findOne({
      _id: existingTask.project,
      owner: req.user.id
    });

    if (!existingProject) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    if (project) {
      const newProject = await Project.findOne({
        _id: project,
        owner: req.user.id
      });

      if (!newProject) {
        return res.status(404).json({
          message: "New project not found"
        });
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        project,
        assignedTo
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("project", "name")
      .populate("assignedTo", "name email");

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message
    });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findOne({
      _id: task.project,
      owner: req.user.id
    });

    if (!project) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message
    });
  }
});

module.exports = router;