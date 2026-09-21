import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const API = "http://localhost:5000";

function App() {
  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // AI
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);

  // Projects
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [editingProject, setEditingProject] = useState(null);

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [selectedProject, setSelectedProject] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // Message
  const [message, setMessage] = useState("");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // LOGIN
  const login = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/auth/login`,
        {
          email,
          password
        }
      );

      localStorage.setItem("token", response.data.token);
      setLoggedIn(true);
      setMessage("Login successful!");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed."
      );
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setProjects([]);
    setTasks([]);
    setResult(null);
    setMessage("");
  };

  // AI SUGGESTIONS
  const generateSuggestions = async () => {
    if (!idea.trim()) {
      setMessage("Please enter a project or task idea.");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/ai/suggest`,
        {
          idea
        },
        getConfig()
      );

      setResult(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to generate suggestions."
      );
    }
  };

  // GET PROJECTS
  const getProjects = async () => {
    try {
      const response = await axios.get(
        `${API}/api/projects`,
        getConfig()
      );

      setProjects(response.data);

      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]._id);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load projects."
      );
    }
  };

  // CREATE PROJECT
  const createProject = async () => {
    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    try {
      await axios.post(
        `${API}/api/projects`,
        {
          name: projectName,
          description: projectDescription
        },
        getConfig()
      );

      setProjectName("");
      setProjectDescription("");
      setMessage("Project created successfully!");

      await getProjects();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create project."
      );
    }
  };

  // EDIT PROJECT
  const startEditProject = (project) => {
    setEditingProject(project._id);
    setProjectName(project.name);
    setProjectDescription(project.description || "");
  };

  // UPDATE PROJECT
  const updateProject = async () => {
    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    try {
      await axios.put(
        `${API}/api/projects/${editingProject}`,
        {
          name: projectName,
          description: projectDescription
        },
        getConfig()
      );

      setEditingProject(null);
      setProjectName("");
      setProjectDescription("");

      setMessage("Project updated successfully!");

      getProjects();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update project."
      );
    }
  };

  // DELETE PROJECT
  const deleteProject = async (id) => {
    try {
      await axios.delete(
        `${API}/api/projects/${id}`,
        getConfig()
      );

      setMessage("Project deleted successfully!");
      setSelectedProject("");

      getProjects();
      getTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete project."
      );
    }
  };

  // GET TASKS
  const getTasks = async () => {
    try {
      const response = await axios.get(
        `${API}/api/tasks`,
        getConfig()
      );

      setTasks(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load tasks."
      );
    }
  };

  // CREATE TASK
  const createTask = async () => {
    if (!taskTitle.trim() || !selectedProject) {
      setMessage("Task title and project are required.");
      return;
    }

    try {
      await axios.post(
        `${API}/api/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
          project: selectedProject
        },
        getConfig()
      );

      setTaskTitle("");
      setTaskDescription("");
      setTaskStatus("todo");
      setTaskPriority("medium");

      setMessage("Task created successfully!");

      getTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create task."
      );
    }
  };

  // EDIT TASK
  const startEditTask = (task) => {
    setEditingTask(task._id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskStatus(task.status);
    setTaskPriority(task.priority);

    if (task.project?._id) {
      setSelectedProject(task.project._id);
    }
  };

  // UPDATE TASK
  const updateTask = async () => {
    if (!taskTitle.trim()) {
      setMessage("Task title is required.");
      return;
    }

    try {
      await axios.put(
        `${API}/api/tasks/${editingTask}`,
        {
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority
        },
        getConfig()
      );

      setEditingTask(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskStatus("todo");
      setTaskPriority("medium");

      setMessage("Task updated successfully!");

      getTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update task."
      );
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    try {
      await axios.delete(
        `${API}/api/tasks/${id}`,
        getConfig()
      );

      setMessage("Task deleted successfully!");

      getTasks();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    }
  };

  // LOAD DATA
  useEffect(() => {
    if (loggedIn) {
      getProjects();
      getTasks();
    }
  }, [loggedIn]);

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="login-container">
        <h1>AI Project & Task Management</h1>

        <p>
          Login to manage your projects and tasks.
        </p>

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>
          Login
        </button>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="header">
        <h1>AI Project & Task Management</h1>

        <p>
          Manage your projects, tasks and AI-powered suggestions.
        </p>

        <button onClick={logout}>
          Logout
        </button>
      </div>

      {/* AI SECTION */}
      <div className="section">
        <h2>🤖 AI Task Suggestions</h2>

        <p>
          Enter a project idea and get suggested tasks.
        </p>

        <input
          type="text"
          placeholder="Example: Build a library management website"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <br />

        <button onClick={generateSuggestions}>
          Generate Tasks
        </button>

        {result && (
          <div className="ai-result">
            <h3>AI Suggestions</h3>

            <p>
              <strong>Priority:</strong>{" "}
              <span className="badge">
                {result.priority}
              </span>
            </p>

            <h4>Suggested Tasks</h4>

            <ul>
              {result.suggestedTasks.map(
                (task, index) => (
                  <li key={index}>
                    {task}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      {/* PROJECT SECTION */}
      <div className="section">
        <h2>📁 Project Management</h2>

        <input
          type="text"
          placeholder="Project name"
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
        />

        <textarea
          placeholder="Project description"
          value={projectDescription}
          onChange={(e) =>
            setProjectDescription(e.target.value)
          }
        />

        {editingProject ? (
          <button onClick={updateProject}>
            Update Project
          </button>
        ) : (
          <button onClick={createProject}>
            Create Project
          </button>
        )}

        <h3>Your Projects</h3>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div
              className="card"
              key={project._id}
            >
              <h3>{project.name}</h3>

              <p>
                {project.description}
              </p>

              <button
                onClick={() =>
                  startEditProject(project)
                }
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteProject(project._id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* TASK SECTION */}
      <div className="section">
        <h2>✅ Task Management</h2>

        <input
          type="text"
          placeholder="Task title"
          value={taskTitle}
          onChange={(e) =>
            setTaskTitle(e.target.value)
          }
        />

        <textarea
          placeholder="Task description"
          value={taskDescription}
          onChange={(e) =>
            setTaskDescription(e.target.value)
          }
        />

        <label>
          <strong>Project:</strong>
        </label>

        <select
          value={selectedProject}
          onChange={(e) =>
            setSelectedProject(e.target.value)
          }
        >
          <option value="">
            Select Project
          </option>

          {projects.map((project) => (
            <option
              key={project._id}
              value={project._id}
            >
              {project.name}
            </option>
          ))}
        </select>

        <br />

        <label>
          <strong>Status:</strong>
        </label>

        <select
          value={taskStatus}
          onChange={(e) =>
            setTaskStatus(e.target.value)
          }
        >
          <option value="todo">
            Todo
          </option>

          <option value="in-progress">
            In Progress
          </option>

          <option value="done">
            Done
          </option>
        </select>

        <br />

        <label>
          <strong>Priority:</strong>
        </label>

        <select
          value={taskPriority}
          onChange={(e) =>
            setTaskPriority(e.target.value)
          }
        >
          <option value="low">
            Low
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="high">
            High
          </option>
        </select>

        <br />

        {editingTask ? (
          <button onClick={updateTask}>
            Update Task
          </button>
        ) : (
          <button onClick={createTask}>
            Create Task
          </button>
        )}

        <h3>Your Tasks</h3>

        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div
              className="card"
              key={task._id}
            >
              <h3>{task.title}</h3>

              <p>
                {task.description}
              </p>

              <span className="badge">
                Status: {task.status}
              </span>

              <span className="badge">
                Priority: {task.priority}
              </span>

              <p>
                <strong>Project:</strong>{" "}
                {task.project?.name}
              </p>

              <button
                onClick={() =>
                  startEditTask(task)
                }
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteTask(task._id)
                }
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* MESSAGE */}
      {message && (
        <p className="message">
          {message}
        </p>
      )}
    </div>
  );
}

export default App;