# GitQuest: The Chrono-Coder's Journey

An interactive, browser-based educational game that teaches Git and GitHub through gamification.

## Project Structure

```
gitquest-game/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic (Git engine, etc.)
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Entry point
│   ├── .env.example     # Environment variables template
│   └── package.json
│
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── assets/      # Static assets
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # State management
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utility functions
│   │   └── main.tsx     # Entry point
│   ├── .env.example     # Environment variables template
│   └── package.json
│
├── shared/              # Shared types and utilities
│   ├── src/
│   │   ├── types/       # Shared TypeScript interfaces
│   │   └── index.ts
│   └── package.json
│
└── package.json         # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gitquest-game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend only (runs on port 3000)
npm run dev:backend

# Frontend only (runs on port 5173)
npm run dev:frontend
```

### Building for Production

Build both frontend and backend:
```bash
npm run build
```

Or build them separately:
```bash
npm run build:backend
npm run build:frontend
```

### Code Quality

The project uses ESLint, Prettier, and Husky for code quality:

```bash
# Lint all workspaces
npm run lint

# Format all workspaces
npm run format
```

Git hooks are automatically set up to run linting and formatting on commit.

## Technology Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18+
- TypeScript
- Vite
- xterm.js (terminal emulation)
- Monaco Editor (code editing)
- gitgraph-js (Git visualization)
- Tailwind CSS

### Shared
- TypeScript interfaces and types
- Shared utilities

## Development Workflow

1. Create a new branch for your feature
2. Make your changes
3. Commit (pre-commit hooks will run automatically)
4. Push and create a pull request

## License

ISC
