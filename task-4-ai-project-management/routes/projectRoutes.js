const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

// Create project
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message
    });
  }
});

// Get user's projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user.id
    }).populate("owner", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message
    });
  }
});

// Get one project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate("owner", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project",
      error: error.message
    });
  }
});

// Update project
router.put("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      {
        name: req.body.name,
        description: req.body.description
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project",
      error: error.message
    });
  }
});

// Delete project
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      message: "Project deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message
    });
  }
});

module.exports = router;