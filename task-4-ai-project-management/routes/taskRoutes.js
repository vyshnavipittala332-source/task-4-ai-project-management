const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
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

// Get all tasks for user's projects
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
      .populate("assignedTo", "name email");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
});

// Get one task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name owner")
      .populate("assignedTo", "name email");

    if (!task || task.project.owner.toString() !== req.user.id) {
      return res.status(404).json({
        message: "Task not found"
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
    const task = await Task.findById(req.params.id).populate(
      "project",
      "owner"
    );

    if (!task || task.project.owner.toString() !== req.user.id) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;
    task.priority = req.body.priority ?? task.priority;
    task.assignedTo = req.body.assignedTo ?? task.assignedTo;

    await task.save();

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
    const task = await Task.findById(req.params.id).populate(
      "project",
      "owner"
    );

    if (!task || task.project.owner.toString() !== req.user.id) {
      return res.status(404).json({
        message: "Task not found"
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