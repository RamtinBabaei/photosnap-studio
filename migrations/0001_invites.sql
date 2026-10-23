CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 80),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK(length(email) <= 254),
  plan TEXT NOT NULL CHECK(plan IN ('basic','pro','business','undecided')),
  billing TEXT NOT NULL CHECK(billing IN ('monthly','yearly')),
  consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_invites_retention ON invites(created_at);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL CHECK(hits > 0)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_retention ON rate_limits(window_start);
