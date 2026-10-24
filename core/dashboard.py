"""Дані для блоків дашборду.

Етап 1: демо-дані. З етапу 2 кожен блок бере дані зі свого конектора
(core/connectors/*), а тут лишається лише збирання в одну відповідь.
"""

DEMO = {
    "demo": True,
    "balance": None,
    "fire": [
        {"title": "Чекліст BB × R22MIE", "due": "31.10", "why": "Івент у Karlsruhe, відкриті пункти в Trello"},
        {"title": "Лист від [ВІДПРАВНИК]", "due": "до пн", "why": "Потрібна відповідь"},
        {"title": "Документи для Teilzeit", "due": "[ДАТА]", "why": "Старт роботи з листопада"},
    ],
    "plan": [
        {"time": "10:00", "title": "Німецька DTZ", "color": "#FF8A3D"},
        {"time": "12:00", "title": "Відповісти на листи", "color": "#4FC3FF"},
        {"time": "14:00", "title": "Зміна Kaffeesack", "color": "#3DDC84"},
        {"time": "18:00", "title": "Созвон BB", "color": "#B48CFF"},
        {"time": "20:00", "title": "Код: голосовий асистент", "color": "#FF8A3D"},
    ],
    "emails": [
        {"from": "[ВІДПРАВНИК]", "time": "18:12", "summary": "Потрібна відповідь до понеділка"},
        {"from": "[ОРЕНДОДАВЕЦЬ]", "time": "15:40", "summary": "Відповідь на заявку по квартирі"},
        {"from": "[РОБОТА]", "time": "11:05", "summary": "Документи для Teilzeit"},
    ],
    "notes": [
        {"title": "Ідеї для івентів BB", "folder": "Bad&Beezy"},
        {"title": "Wortschatz B1", "folder": "Deutsch"},
        {"title": "Архітектура Jarvis", "folder": "Проєкти"},
    ],
    "access": ["Obsidian", "Файли", "Gmail", "Календар", "Trello"],
    "projects": [
        {"name": "Голосовий асистент", "status": "В РОБОТІ", "color": "#4FC3FF",
         "analysis": "Зараз на Gemini, слабке залізо (MacBook 2014).",
         "idea": "Перевести мозок на Claude API і дати доступ до Obsidian."},
        {"name": "AI Event Manager", "status": "ПРАЦЮЄ", "color": "#3DDC84",
         "analysis": "Допомагає з дедлайнами, але живе окремо від Trello.",
         "idea": "Синхронізувати етапи з Trello-дошкою BB."},
        {"name": "Мандала цілей", "status": "ПРАЦЮЄ", "color": "#3DDC84",
         "analysis": "Генерує сітку 9×9, хостинг на Vercel.",
         "idea": "Щотижневий AI-чекін по прогресу цілей."},
        {"name": "Розумний дім", "status": "ІДЕЯ", "color": "#FFB547",
         "analysis": "Arduino-екосистема ще в плані.",
         "idea": "Почати з одного світла під голосову команду."},
    ],
}


def get_dashboard() -> dict:
    return DEMO
