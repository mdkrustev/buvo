-- Migration number: 0002 	 2026-06-03T20:20:44.126Z
PRAGMA foreign_keys = ON;

CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_from REAL,
  price_to REAL,
  duration_text TEXT,
  active INTEGER DEFAULT 1,

  FOREIGN KEY(company_id) REFERENCES companies(id)
);

CREATE TABLE faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  FOREIGN KEY(company_id) REFERENCES companies(id)
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(company_id) REFERENCES companies(id)
);

CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  visitor_email TEXT,
  visitor_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(company_id) REFERENCES companies(id)
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);