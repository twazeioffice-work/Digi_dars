from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, center_id: str):
        await websocket.accept()
        if center_id not in self.active_connections:
            self.active_connections[center_id] = []
        self.active_connections[center_id].append(websocket)

    def disconnect(self, websocket: WebSocket, center_id: str):
        if center_id in self.active_connections:
            if websocket in self.active_connections[center_id]:
                self.active_connections[center_id].remove(websocket)

    async def broadcast_to_center(self, center_id: str, message: dict):
        if center_id in self.active_connections:
            for connection in self.active_connections[center_id]:
                await connection.send_json(message)

    async def broadcast_all(self, message: dict):
        for connections in self.active_connections.values():
            for connection in connections:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    center_id = payload.get("center_id", "GLOBAL")
    await manager.connect(websocket, center_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, center_id)
