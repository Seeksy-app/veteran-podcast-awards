CREATE TABLE IF NOT EXISTS podchaser_cache (
  cache_key TEXT PRIMARY KEY,
  response JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_podchaser_cache_fetched ON podchaser_cache (fetched_at);
