"use client";

import {
  useTracks,
  ParticipantTile,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";

export function ParticipantBar() {
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  const humanTracks = tracks.filter(
    (t) => t.participant.identity !== "browser-agent"
  );

  if (humanTracks.length === 0) {
    return null;
  }

  return (
    <div className="relative w-48 border-l border-border bg-background overflow-y-auto flex flex-col gap-1.5 p-2">
      <div className="pointer-events-none sticky top-0 z-10 h-4 bg-gradient-to-b from-background to-transparent" />

      {humanTracks.map((trackRef) => (
        <div key={trackRef.participant.sid} className="overflow-hidden rounded-lg border border-border">
          <ParticipantTile
            trackRef={trackRef}
            className="w-full aspect-video"
          />
        </div>
      ))}

      <div className="pointer-events-none sticky bottom-0 z-10 h-4 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
