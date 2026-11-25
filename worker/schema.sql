-- D1 schema for anonymous feedback on nastyplot.org (NO IP, NO user agent, NO headers, NO viewer id)
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  page TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL
);
