CREATE TABLE IF NOT EXISTS podcast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id TEXT NOT NULL,
  podcast_title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'directory',
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE podcast_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can report" ON podcast_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can read reports" ON podcast_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX idx_podcast_reports_resolved ON podcast_reports (resolved, reported_at DESC);
