"""Brain: розмова з Claude.

Етап 1 — тільки діалог з контекстом дашборду.
Інструменти (пошта, Obsidian, Trello) додаються з етапу 2 у core/tools.py.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

import anthropic

from . import config, db
from .dashboard import get_dashboard

SYSTEM_PROMPT = """Ти — Jarvis, особистий асистент користувача на імʼя {name}.
Відповідай українською, коротко і по суті, як помічник, що знає контекст.
Зараз: {now}.

Що зараз на дашборді користувача (може бути демо-дані до підключення сервісів):
{dashboard}

Правила:
- Ти не надсилаєш листи, не видаляєш і не платиш. Якщо користувач просить дію назовні,
  підготуй чернетку і скажи, що вона чекає підтвердження.
- Якщо чогось не знаєш — так і скажи, не вигадуй.
"""

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        if not config.ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY не задано у файлі .env")
        _client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _client


def _dashboard_summary() -> str:
    d = get_dashboard()
    lines = ["Що горить:"]
    lines += [f"- {f['title']} ({f['due']}): {f['why']}" for f in d["fire"]]
    lines.append("План на день:")
    lines += [f"- {p['time']} {p['title']}" for p in d["plan"]]
    lines.append("Важливі листи:")
    lines += [f"- {e['from']}: {e['summary']}" for e in d["emails"]]
    return "\n".join(lines)


def _history_for_api(limit: int = 20) -> list[dict]:
    """Історія з SQLite у форматі API: ролі мають чергуватися і починатися з user."""
    msgs = [{"role": m["role"], "content": m["content"]} for m in db.recent_messages(limit)]
    while msgs and msgs[0]["role"] != "user":
        msgs.pop(0)
    merged: list[dict] = []
    for m in msgs:
        if merged and merged[-1]["role"] == m["role"]:
            merged[-1]["content"] += "\n\n" + m["content"]
        else:
            merged.append(dict(m))
    return merged


def ask(text: str, source: str = "dashboard") -> str:
    """Записує питання, питає Claude, записує і повертає відповідь."""
    db.add_message("user", text, source)
    now = datetime.now(ZoneInfo(config.TIMEZONE)).strftime("%A, %d.%m.%Y %H:%M")
    system = SYSTEM_PROMPT.format(name=config.USER_NAME, now=now, dashboard=_dashboard_summary())

    response = _get_client().messages.create(
        model=config.CLAUDE_MODEL,
        max_tokens=1024,
        system=system,
        messages=_history_for_api(),
    )
    answer = "".join(block.text for block in response.content if block.type == "text").strip()
    db.add_message("assistant", answer, source)
    return answer
