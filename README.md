# 🗂️ PERN Project Management System

A powerful and scalable **Project Management Web Application** built using the **PERN Stack** (PostgreSQL, Express, React, Node.js).  
This application allows teams to manage projects, assign tasks, collaborate in real-time, and streamline productivity with modern automation tools.

Designed with clean UI, real-time updates, email notifications, and secure authentication.

🌐 **Live Demo:** https://project-management-client-nu.vercel.app/

---

## ✨ Features

- 📁 **Project & Task Management** – Create, update, organize projects and tasks effortlessly  
- 👥 **Team Collaboration** – Assign tasks, track progress, and manage team roles  
- 🔐 **Secure Authentication** using Clerk  
- 🔄 **Real-Time Updates** with WebSockets (ws)  
- 📧 **Smart Email Notifications** via Nodemailer  
- ⏳ **Background Jobs** and automations with Inngest  
- 🗄️ **Neon Serverless PostgreSQL** for fast and scalable database performance  
- 📊 **Clean & Responsive UI** for seamless usability on all devices  

---

## 🧩 Tech Stack

### 🎨 Frontend (Client)

- **React** (`react`, `react-dom`) – Component-based UI library.
- **React Router DOM** (`react-router-dom`) – Navigation and routing system.
- **Clerk React** (`@clerk/clerk-react`) – Frontend authentication and user session handling.
- **Redux Toolkit** (`@reduxjs/toolkit`) – State management for global store.
- **React Redux** (`react-redux`) – React bindings for Redux.
- **Axios** (`axios`) – HTTP client for API requests.
- **Tailwind CSS** (`tailwindcss`, `@tailwindcss/vite`) – Utility-first CSS for fast and responsive styling.
- **Lucide React** (`lucide-react`) – Beautiful icons for UI components.
- **React Hot Toast** (`react-hot-toast`) – Toast notifications for user feedback.
- **Recharts** (`recharts`) – Charting library for visual analytics & insights.
- **date-fns** (`date-fns`) – Lightweight date formatting utilities.

### 🎭 Backend (Server)
- **Express.js** (`express`) – Fast and minimal backend framework.
- **Node.js** – JavaScript runtime for server-side logic.
- **Prisma ORM** (`@prisma/client`, `@prisma/adapter-neon`, `prisma`) – Type-safe database ORM and schema management.
- **Neon Serverless PostgreSQL** (`@neondatabase/serverless`) – Scalable cloud-hosted PostgreSQL.
- **Clerk Auth Middleware** (`@clerk/express`) – Secure authentication & user sessions.
- **CORS** (`cors`) – Handling cross-origin communication.
- **dotenv** (`dotenv`) – Environment variable management.
- **WebSockets** (`ws`) – Real-time communication for live task updates.
- **Inngest** (`inngest`) – Background jobs and scheduled automation.
- **Nodemailer** (`nodemailer`) – Email notifications for invites and task assignments.

### ✨ Development Tools
- **Nodemon** (`nodemon`) – Auto-restart server during development.
- **Prisma CLI** (`prisma`) – Database migrations & schema tools.

---

## 🛠️ Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/GS-Bishwasa/Project-Management.git
