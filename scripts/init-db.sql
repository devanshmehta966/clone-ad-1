-- Initialize database for Next.js Marketing Dashboard
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database if it doesn't exist
SELECT 'CREATE DATABASE marketing_dashboard'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marketing_dashboard')\gexec

-- Connect to the database
\c marketing_dashboard;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a comment to indicate the database is ready
COMMENT ON DATABASE marketing_dashboard IS 'Marketing Dashboard Database - Initialized';