# GitQuest Database Setup Guide

This guide will help you set up the PostgreSQL database for GitQuest.

## Prerequisites

- PostgreSQL 12 or higher installed
- Node.js 18 or higher installed
- npm or yarn package manager

## Step 1: Install PostgreSQL

If you haven't installed PostgreSQL yet:

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create the Database

### Option A: Using psql command line

```bash
# Connect to PostgreSQL as the postgres user
psql -U postgres

# Inside psql, run:
CREATE DATABASE gitquest;

# Enable the pgcrypto extension for UUID generation
\c gitquest
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Exit psql
\q
```

### Option B: Using the provided SQL script

```bash
# Run the initialization script
psql -U postgres -f scripts/init-db.sql
```

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gitquest
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here
   ```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Migrations

Run the database migrations to create all tables:

```bash
npm run migrate:latest
```

You should see output similar to:
```
Batch 1 run: 5 migrations
```

## Step 6: Verify Setup

Start the development server:

```bash
npm run dev
```

Then check the health endpoint:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "message": "GitQuest API is running",
  "database": "connected"
}
```

## Database Schema

The following tables will be created:

1. **users** - User accounts
2. **user_progress** - User game progress and XP
3. **achievements** - Achievement definitions
4. **user_achievements** - User-earned achievements
5. **quest_completions** - Completed quests tracking

## Migration Commands

- `npm run migrate:latest` - Run all pending migrations
- `npm run migrate:rollback` - Rollback the last batch of migrations
- `npm run migrate:make <name>` - Create a new migration file

## Troubleshooting

### Connection Refused Error

If you get a connection refused error:
1. Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
2. Verify the port in your `.env` matches PostgreSQL's port (default: 5432)
3. Check if PostgreSQL is listening on localhost: `psql -U postgres -h localhost`

### Authentication Failed Error

If you get an authentication error:
1. Verify your password in the `.env` file
2. Check PostgreSQL's `pg_hba.conf` file for authentication settings
3. Try connecting manually: `psql -U postgres -d gitquest`

### Database Does Not Exist Error

If migrations fail with "database does not exist":
1. Create the database manually using Step 2
2. Verify the database name in your `.env` file matches

### Extension Not Found Error

If you get "extension pgcrypto does not exist":
1. Connect to the database: `psql -U postgres -d gitquest`
2. Run: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
3. Verify: `SELECT * FROM pg_extension WHERE extname = 'pgcrypto';`

## Next Steps

After successful database setup:
1. Proceed to implement authentication endpoints (Task 3)
2. Test user registration and login flows
3. Implement the Git simulation engine (Task 4)

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Knex.js Documentation](https://knexjs.org/)
- [GitQuest Design Document](.kiro/specs/gitquest-game/design.md)
