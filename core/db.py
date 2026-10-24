"""SQLite: історія чату і журнал дій. Один файл data/jarvis.db."""
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'dashboard',
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS action_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
);
"""


@contextmanager
def connect():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init():
    with connect() as conn:
        conn.executescript(SCHEMA)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def add_message(role: str, content: str, source: str = "dashboard") -> dict:
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO messages (role, content, source, created_at) VALUES (?, ?, ?, ?)",
            (role, content, source, _now()),
        )
        row = conn.execute("SELECT * FROM messages WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)


def recent_messages(limit: int = 20) -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM messages ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in reversed(rows)]


def log_action(action: str, details: str = "") -> None:
    with connect() as conn:
        conn.execute(
            "INSERT INTO action_log (action, details, created_at) VALUES (?, ?, ?)",
            (action, details, _now()),
        )
