-- GitQuest Database Initialization Script
-- Run this script to create the database and enable required extensions

-- Create database (run this as postgres superuser)
-- Note: You may need to disconnect from the gitquest database first if it exists
-- DROP DATABASE IF EXISTS gitquest;
CREATE DATABASE gitquest;

-- Connect to the gitquest database and enable extensions
\c gitquest;

-- Enable UUID generation extension (required for primary keys)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Database is now ready for migrations
-- Run: npm run migrate:latest
