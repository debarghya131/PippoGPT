# 🤖 PippoGPT

PippoGPT is a full-stack AI chat assistant built with React, Express, MongoDB, Clerk, Groq, and Arcjet. It gives guests a demo chat experience and lets authenticated users create, save, revisit, and delete real AI chat threads.

## 🚀 Live Demo Link

Live demo: https://pippo.debarghya.org   👈

## 💡 Motivation

The motivation behind PippoGPT was to build a ChatGPT-style assistant with a real full-stack architecture instead of only a frontend demo. The project focuses on authentication, persistent chat history, AI response generation, markdown/code rendering, rate limiting, and a clean chat interface.

## ✨ Features

- Guest demo mode with predefined chat threads
- Clerk authentication for login and signup
- Authenticated chat experience with saved conversations
- Create, view, and delete chat threads
- MongoDB-backed user and thread storage
- Groq-powered AI responses with conversation context
- Markdown rendering for assistant replies
- Syntax highlighting for code blocks
- Copy-code button for generated code
- Responsive sidebar and chat layout
- Arcjet-based daily chat rate limiting
- Backend health check endpoint

## 🏗️ Architecture

PippoGPT uses a separated frontend and backend architecture.

```text
React + Vite frontend
        |
        | HTTP requests with Clerk auth token
        v
Express backend API
        |
        | Auth sync, chat routing, rate limiting
        v
MongoDB + Groq API + Arcjet
```

### Visual Flow

```mermaid
flowchart TD
    A[User] --> B[React + Vite Frontend]
    B --> C{Authentication State}

    C -->|Guest User| D[Demo Chats]
    C -->|Logged In User| E[Clerk Authentication]

    E --> F[Express Backend API]
    F --> G[Sync User with MongoDB]
    F --> H[Arcjet Rate Limiting]

    H --> I[Chat Route]
    I --> J[Groq AI Model]
    J --> K[Assistant Response]

    K --> L[Save Thread + Messages]
    L --> M[MongoDB]
    K --> N[Render Markdown Response]
    N --> B

    F --> O[Thread Routes]
    O --> P[Create / Read / Delete Threads]
    P --> M
```

The frontend handles the chat UI, demo mode, authentication modal, thread selection, message rendering, and API calls. The backend verifies Clerk authentication, syncs Clerk users into MongoDB, stores chat threads, applies rate limiting, sends message context to Groq, and returns assistant replies.

## 📁 Folder Structure

```text
pippo_gpt/
├── backend/
│   ├── models/
│   │   ├── Thread.js
│   │   └── User.js
│   ├── routes/
│   │   ├── Auth.js
│   │   └── Chat.js
│   ├── scripts/
│   │   └── migrateClerkUsers.js
│   ├── utils/
│   │   ├── Arcjet.js
│   │   ├── Auth.js
│   │   └── Openai.js
│   ├── Server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── pippo.png
│   │       └── pippo-favicon.png
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── AuthModal.jsx
│   │   ├── AuthModal.css
│   │   ├── Chat.jsx
│   │   ├── Chat.css
│   │   ├── ChatWindow.jsx
│   │   ├── MyContext.jsx
│   │   ├── Slidbar.jsx
│   │   ├── Slidbar.css
│   │   ├── demoChats.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

## 🗄️ Database Design

The project uses MongoDB with Mongoose. Clerk handles authentication, while MongoDB stores the synced user profile and each user's chat threads.

### Visual Schema

```mermaid
erDiagram
    USER ||--o{ THREAD : owns
    THREAD ||--o{ MESSAGE : contains

    USER {
        ObjectId _id
        String clerkId
        String name
        String email
        String passwordHash
        Date createdAt
    }

    THREAD {
        ObjectId _id
        String threadId
        ObjectId userId
        String title
        Date createdAt
        Date updatedAt
    }

    MESSAGE {
        String role
        String content
        Date timestamp
    }
```

### 👤 User Collection

Stores the local application profile for a Clerk-authenticated user.

```js
{
  clerkId: String,
  name: String,
  email: String,
  passwordHash: String,
  createdAt: Date
}
```

### 💬 Thread Collection

Stores one chat conversation. Each thread belongs to a user and contains embedded message objects.

```js
{
  threadId: String,
  userId: ObjectId,
  title: String,
  messages: [
    {
      role: "system" | "user" | "assistant",
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### 🔗 Relationships

- One user can have many chat threads.
- One thread contains many embedded messages.
- Each thread is queried with both `threadId` and `userId` so users can only access their own chats.
- `clerkId`, `email`, and `userId` are indexed for faster lookup and safer user-thread matching.

## 📸 Screenshots

### Home Screen

![PippoGPT home screen](screenshots/home-screen.png)

### Demo Profile Chat

![PippoGPT demo profile chat](screenshots/demo-profile-chat.png)

### Code Response

![PippoGPT code response](screenshots/code-response.png)

### Login Modal

![PippoGPT login modal](screenshots/login-modal.png)

### Live Chat Thread

![PippoGPT live chat thread](screenshots/live-chat-thread.png)

## 🛠️ Tech Stack

### 🎨 Frontend

- React
- Vite
- Clerk React
- React Markdown
- rehype-highlight
- CSS

### ⚙️ Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Clerk Express
- Groq SDK
- Arcjet
- dotenv
- CORS

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/debarghya131/PippoGPT.git
cd PippoGPT
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## 🔐 Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pippo_gpt
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_groq_model
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
ALLOW_START_WITHOUT_DB=false
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🧩 Challenges Faced

- Managing authenticated and guest chat experiences in the same UI
- Syncing Clerk users with MongoDB users
- Preserving conversation context across messages
- Designing a thread-based chat history system
- Handling API failures and database connection issues
- Preventing unlimited AI API usage
- Rendering markdown and code responses cleanly

## ✅ Solutions Implemented

- Added demo chats for non-authenticated users
- Used Clerk middleware to protect backend routes
- Created a user sync utility to connect Clerk accounts with MongoDB records
- Stored every chat as a thread with embedded message history
- Sent full thread context to Groq for better follow-up answers
- Added Arcjet token bucket rate limiting for chat requests
- Added backend environment validation and a `/health` route
- Used React Markdown and rehype-highlight for readable AI responses

## 🧪 Testing

Current available checks:

```bash
cd frontend
npm run lint
npm run build
```

The backend currently has a placeholder test script:

```bash
cd backend
npm test
```

Automated backend tests are a future improvement.

## ⚡ Optimization

- Thread lists are sorted by latest update
- Chat messages are rendered optimistically while waiting for API response
- MongoDB fields such as `clerkId`, `email`, and `userId` are indexed
- Backend returns normalized thread metadata for the sidebar
- Frontend build is handled through Vite for fast development and optimized production assets

## 🛡️ Security

- Clerk authentication protects backend API routes
- Backend checks required environment variables before startup
- Sensitive values are stored in `.env` files and excluded from Git
- Arcjet rate limiting helps control abuse and API usage
- MongoDB queries are scoped by authenticated user ID

For production, configure stricter CORS origins instead of using open CORS.

## 🔮 Future Improvements

- Add live deployment link
- Add screenshots and demo video
- Add backend unit and integration tests
- Add streaming AI responses
- Add real model selection
- Add attachment support
- Add voice input support
- Improve production CORS configuration
- Add pagination for long chat histories
- Add better analytics and error monitoring

## 📚 Learnings

This project helped practice full-stack AI application development, including React UI design, Express API routing, MongoDB schema design, Clerk authentication, user synchronization, AI API integration, rate limiting, markdown rendering, and environment-based configuration.

## 👨‍💻 Author Details

**Debarghya Bandyopadhyay**

- Computer Science engineering student and developer from Kolkata

### Be My Friend

I always like to make new friends. Follow me on:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Debarghya%20Bandyopadhyay-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/debarghya-bandyopadhyay-953b02400?utm_source=share_via&utm_content=profile&utm_medium=member_android)

[![X](https://img.shields.io/badge/X-debarghya131-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/debarghya131)

[![GitHub](https://img.shields.io/badge/GitHub-debarghya131-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/debarghya131)

[![Portfolio](https://img.shields.io/badge/Portfolio-portfolio.debarghya.org-14A800?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio.debarghya.org)

[![Email](https://img.shields.io/badge/Email-debarghyabandyopadhyay191%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:debarghyabandyopadhyay191@gmail.com)
