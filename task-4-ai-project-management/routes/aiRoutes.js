const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/suggest", auth, async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({
        message: "Please provide a project or task idea"
      });
    }

    const text = idea.toLowerCase();

    let priority = "medium";
    let suggestedTasks = [];

    if (
      text.includes("urgent") ||
      text.includes("important") ||
      text.includes("deadline")
    ) {
      priority = "high";
    }

    if (text.includes("website") || text.includes("web")) {
      suggestedTasks = [
        "Create project requirements",
        "Design the user interface",
        "Develop the frontend",
        "Create backend APIs",
        "Connect the database",
        "Test the application"
      ];
    } else if (text.includes("mobile") || text.includes("app")) {
      suggestedTasks = [
        "Define application requirements",
        "Design application screens",
        "Develop application features",
        "Connect backend APIs",
        "Test the application",
        "Prepare the final release"
      ];
    } else if (
      text.includes("ai") ||
      text.includes("machine learning") ||
      text.includes("ml")
    ) {
      suggestedTasks = [
        "Collect and prepare data",
        "Perform data analysis",
        "Select an AI or ML approach",
        "Train the model",
        "Evaluate the model",
        "Integrate the model into the application"
      ];
    } else {
      suggestedTasks = [
        "Define project requirements",
        "Break the project into smaller tasks",
        "Develop the main functionality",
        "Test the implementation",
        "Fix errors and improve the project",
        "Prepare the final project"
      ];
    }

    res.json({
      message: "AI task suggestions generated successfully",
      input: idea,
      priority,
      suggestedTasks
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate suggestions",
      error: error.message
    });
  }
});

module.exports = router;