import { NextResponse } from "next/server";
import { AccessToken, type VideoGrant } from "livekit-server-sdk";
import { RoomConfiguration, RoomAgentDispatch } from "@livekit/protocol";

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const AGENT_NAME = process.env.AGENT_NAME || "browser-agent";

export const revalidate = 0;

export async function POST() {
  if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
    return new NextResponse("Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET", {
      status: 500,
    });
  }

  const roomName = `browser_${Math.floor(Math.random() * 10_000)}`;
  const identity = `user_${Math.floor(Math.random() * 10_000)}`;

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity,
    name: "user",
    ttl: "15m",
  });

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  at.roomConfig = new RoomConfiguration({
    agents: [new RoomAgentDispatch({ agentName: AGENT_NAME })],
  });

  const token = await at.toJwt();

  return NextResponse.json(
    {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: token,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
