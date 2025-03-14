CREATE TABLE IF NOT EXISTS users (
    name TEXT NOT NULL
);

INSERT INTO users (name) VALUES
    ('Alice'),
    ('Bob'),
    ('Charlie'),
    ('David'),
    ('Eve')
ON CONFLICT DO NOTHING;
