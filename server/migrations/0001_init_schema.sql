-- Migration number: 0001 	 2026-04-27T09:31:53.598Z
PRAGMA foreign_keys = ON;

--------------------------------------------------
-- USERS
--------------------------------------------------
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  google_id TEXT UNIQUE,
  plan_id INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  login_at TEXT DEFAULT CURRENT_TIMESTAMP,
  role TEXT NOT NULL DEFAULT 'USER'
);