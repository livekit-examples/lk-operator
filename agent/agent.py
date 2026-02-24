import asyncio
import json
import logging
import os
from pathlib import Path

from livekit import rtc
from livekit.agents import AgentServer, AutoSubscribe, JobContext, cli
from livekit.plugins.browser import BrowserAgent
from livekit.plugins.anthropic import LLM

import dotenv
dotenv.load_dotenv()

logger = logging.getLogger("browser-agent")
logger.setLevel(logging.INFO)

AGENT_NAME = os.environ.get("AGENT_NAME", "browser-agent")

server = AgentServer()

@server.rtc_session(agent_name=AGENT_NAME)
async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.SUBSCRIBE_NONE)

    agent = BrowserAgent(
        url="https://www.google.com/",
        llm=LLM(model="claude-sonnet-4-6", api_key="pending"),
        width=1024,
        height=768,
        instructions="You are a helpful AI that can browse the web. When the user asks you to do something, use the computer tool to interact with the browser. Describe what you see and what you're doing.",
        chat_enabled=False,
    )
    await agent.start(room=ctx.room)
    ctx.add_shutdown_callback(agent.aclose)

    @ctx.room.local_participant.register_rpc_method("set-api-key")
    async def _handle_set_api_key(
        data: rtc.rpc.RpcInvocationData,
    ) -> str:
        try:
            payload = json.loads(data.payload)
            key = payload.get("apiKey", "")
            if key:
                agent._llm = LLM(model="claude-sonnet-4-6", api_key=key)

                if not agent._chat_enabled:
                    agent._chat_enabled = True

                    @ctx.room.on("data_received")
                    def _on_chat_data(packet: rtc.DataPacket) -> None:
                        if packet.topic != "browser-agent-chat":
                            return
                        try:
                            d = json.loads(packet.data)
                            text = d.get("text", "")
                            if text:
                                agent._pending_messages.put_nowait(text)
                        except (json.JSONDecodeError, UnicodeDecodeError):
                            pass

                    agent._on_chat_data = _on_chat_data

                logger.info("API key received from user, AI chat enabled")
                return json.dumps({"status": "ok"})
            return json.dumps({"status": "error", "message": "Empty key"})
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    logger.info("Browser started. Waiting for API key to enable AI chat...")


if __name__ == "__main__":
    cli.run_app(server)
