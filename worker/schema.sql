-- D1 schema for anonymous feedback on nastyplot.org (NO IP, NO user agent, NO headers, NO viewer id)
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  page TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL
);
-- Kip job 78 L2 (Nov 28): the daily 180-day purge (DELETE ... WHERE at < ?) reads this index instead of every row
CREATE INDEX IF NOT EXISTS idx_feedback_at ON feedback(at);

-- anonymous daily totals (Nov 25): one row per day and event name; the Worker only ever adds 1 to n (NO IP, NO user agent,
-- NO headers, NO referrer, NO id, no time of day). Event names: worker/feedback-lib.mjs COUNT_KEYS ("teamcheck").
CREATE TABLE IF NOT EXISTS counts (
  day TEXT NOT NULL,
  k TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, k)
);
