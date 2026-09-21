# AI Project & Task Management Platform

A full-stack project and task management platform developed as part of the Innovation Hacks Full Stack Development Internship.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing
- Project management
- Create, edit and delete projects
- Task management
- Create, edit and delete tasks
- Task status and priority management
- MongoDB database integration
- AI-based task suggestions
- Responsive dashboard

## Technologies Used

### Frontend
- React.js
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

## AI Feature

The application includes an AI-based task suggestion feature.

Users can enter a project or task idea, and the system generates relevant task suggestions and recommends a priority based on the entered idea.

## Project Structure

```text
task-4-ai-project-management/
├── models/
├── routes/
├── middleware/
├── server.js
├── .env
├── .gitignore
└── package.json

frontend/
├── src/
├── public/
├── index.html
└── package.json