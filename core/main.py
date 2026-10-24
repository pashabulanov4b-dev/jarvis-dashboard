"""Jarvis Core: API, WebSocket і роздача дашборду.

Запуск з кореня проєкту:  python -m core.main
"""
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import brain, config, db
from .dashboard import get_dashboard


class Hub:
    """Усі відкриті дашборди: щоб відповідь з голосу зʼявлялась і на екрані."""

    def __init__(self):
        self.clients: set[WebSocket] = set()

    async def join(self, ws: WebSocket):
        await ws.accept()
        self.clients.add(ws)

    def leave(self, ws: WebSocket):
        self.clients.discard(ws)

    async def broadcast(self, event: dict):
        for ws in list(self.clients):
            try:
                await ws.send_json(event)
            except Exception:
                self.leave(ws)


hub = Hub()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    db.init()
    yield


app = FastAPI(title="Jarvis Core", lifespan=lifespan)


class ChatIn(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    source: str = "dashboard"


@app.get("/api/health")
def health():
    return {"ok": True, "model": config.CLAUDE_MODEL, "claude_key": bool(config.ANTHROPIC_API_KEY)}


@app.get("/api/dashboard")
def dashboard():
    return get_dashboard()


@app.get("/api/messages")
def messages(limit: int = 30):
    return db.recent_messages(limit)


@app.post("/api/chat")
async def chat(body: ChatIn):
    await hub.broadcast({"type": "message", "role": "user", "content": body.text})
    try:
        answer = await run_in_threadpool(brain.ask, body.text, body.source)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:  # помилка мережі або API
        raise HTTPException(status_code=502, detail=f"Claude недоступний: {e}")
    await hub.broadcast({"type": "message", "role": "assistant", "content": answer})
    return {"answer": answer}


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await hub.join(ws)
    try:
        while True:
            await ws.receive_text()  # клієнт нічого не шле, тримаємо зʼєднання
    except WebSocketDisconnect:
        hub.leave(ws)


# Зібраний дашборд (web/dist) роздає сам сервер
if config.WEB_DIST.exists():
    app.mount("/assets", StaticFiles(directory=config.WEB_DIST / "assets"), name="assets")

    @app.get("/{path:path}")
    def spa(path: str):
        return FileResponse(config.WEB_DIST / "index.html")


if __name__ == "__main__":
    uvicorn.run("core.main:app", host=config.HOST, port=config.PORT)
