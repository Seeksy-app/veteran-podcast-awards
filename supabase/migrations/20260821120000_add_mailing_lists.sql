INSERT INTO mailing_lists (name, description)
VALUES
  ('Sponsorship Inquiries', 'Companies and individuals interested in sponsoring'),
  ('Nominated Podcasts', 'Podcasts submitted for nomination via website forms'),
  ('Registered Users', 'Users who created an account on the platform')
ON CONFLICT (name) DO NOTHING;
