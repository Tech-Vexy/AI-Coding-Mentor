import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import websockets
from app.auth.utils import decode_access_token
from app.agents.config import agent_settings

router = APIRouter()

async def proxy_gemini(client_ws: WebSocket, gemini_ws: websockets.WebSocketClientProtocol):
    """Bidirectional proxy between client WebSocket and Gemini WebSocket"""

    async def client_to_gemini():
        try:
            while True:
                data = await client_ws.receive_text()
                await gemini_ws.send(data)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"Client to Gemini Error: {e}")

    async def gemini_to_client():
        try:
            async for message in gemini_ws:
                await client_ws.send_text(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Gemini to Client Error: {e}")

    # Run both tasks concurrently
    await asyncio.gather(
        client_to_gemini(),
        gemini_to_client()
    )

@router.websocket("/ws/gemini")
async def gemini_proxy(websocket: WebSocket, token: str = Query(...)):
    """
    Proxies WebSocket connections to the Gemini Live API.
    This hides the GEMINI_API_KEY from the frontend client.
    """

    # 1. Authenticate the connection using the custom JWT
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await websocket.accept()

    # 2. Get API Key from agent settings which parses .env safely
    gemini_key = agent_settings.GEMINI_API_KEY
    if not gemini_key or gemini_key == "mock_gemini_key":
        await websocket.close(code=1011, reason="Server missing Gemini configuration")
        return

    ws_url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={gemini_key}"

    # 3. Connect to Gemini and start proxying
    try:
        async with websockets.connect(ws_url) as gemini_ws:
            await proxy_gemini(websocket, gemini_ws)
    except Exception as e:
        print(f"Proxy Connection Error: {e}")
        try:
            await websocket.close(code=1011, reason="Upstream connection failed")
        except:
            pass
