# Database Setup

This directory contains the database configuration, migrations, and seeds for GitQuest.

## Prerequisites

- PostgreSQL 12+ installed and running
- Database credentials configured in `.env` file

## Setup Instructions

### 1. Create Database

First, create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gitquest;

# Exit psql
\q
```

### 2. Configure Environment

Update the `.env` file in the backend directory with your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gitquest
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

### 3. Run Migrations

Run the migrations to create all tables:

```bash
npm run migrate:latest
```

## Migration Commands

- `npm run migrate:latest` - Run all pending migrations
- `npm run migrate:rollback` - Rollback the last batch of migrations
- `npm run migrate:make <name>` - Create a new migration file

## Database Schema

### Tables

1. **users** - User account information
   - id (UUID, primary key)
   - username (string, unique)
   - email (string, unique)
   - password_hash (string)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **user_progress** - User game progress tracking
   - id (UUID, primary key)
   - user_id (UUID, foreign key to users)
   - xp (integer)
   - level (integer)
   - current_chapter (string, nullable)
   - current_quest (string, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **achievements** - Achievement definitions
   - id (UUID, primary key)
   - name (string, unique)
   - description (text)
   - badge_icon (string)
   - created_at (timestamp)

4. **user_achievements** - Junction table for user achievements
   - id (UUID, primary key)
   - user_id (UUID, foreign key to users)
   - achievement_id (UUID, foreign key to achievements)
   - earned_at (timestamp)

5. **quest_completions** - Quest completion tracking
   - id (UUID, primary key)
   - user_id (UUID, foreign key to users)
   - quest_id (string)
   - completed_at (timestamp)
   - xp_earned (integer)

## Connection Pooling

The database connection uses connection pooling with the following configuration:
- Minimum connections: 2
- Maximum connections: 10

This ensures efficient resource usage while maintaining good performance.
