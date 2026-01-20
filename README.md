# TODO MERN Frontend

A modern TODO application built with React, Vite, and Tailwind CSS. This is the frontend application for a MERN stack TODO app.

## Features

- ✅ Add, edit, and delete todos
- 🔐 User authentication (Login/Signup)
- 🌙 Dark mode support
- 📧 Email todos functionality
- 👤 User profile with editable username
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 💾 Local storage for guest users

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd TODO_MERN_FRONTEND
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables (Optional)

If you want to use a local backend server instead of the production backend, create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and set your local backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

**Note:** If you don't create a `.env` file, the app will use the production backend by default.

### 4. Run the development server

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another port if 5173 is in use).

### 5. Build for production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
TODO_MERN_FRONTEND/
├── src/
│   ├── component/       # React components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Todolist.jsx
│   │   ├── Todos.jsx
│   │   └── ...
│   ├── utils/          # Utility functions
│   │   └── api.js      # API configuration
│   ├── App.jsx         # Main app component
│   └── main.jsx        # App entry point
├── public/             # Static assets
├── .env.example        # Environment variables example
└── package.json        # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Backend Configuration

By default, the app connects to: `https://todo-mern-backend-ldod.onrender.com`

To use a local backend, set the `VITE_API_BASE_URL` environment variable in your `.env` file.

## Troubleshooting

### Port already in use
If port 5173 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual port number.

### Dependencies issues
If you encounter issues with dependencies, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors
Make sure all environment variables are properly set and that your Node.js version is compatible.

## License

This project is private and proprietary.
