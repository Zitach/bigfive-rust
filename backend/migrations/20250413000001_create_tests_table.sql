CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY NOT NULL,
    test_id TEXT NOT NULL,
    lang TEXT NOT NULL,
    invalid INTEGER NOT NULL,
    time_elapsed INTEGER NOT NULL,
    date_stamp TEXT NOT NULL,
    answers TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
