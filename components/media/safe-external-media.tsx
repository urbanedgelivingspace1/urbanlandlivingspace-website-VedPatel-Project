"use client";

import { useState } from "react";
import { videoPlaybackUrls } from "@/lib/media/property-video";

type Props = Readonly<{
  provider: "GOOGLE_DRIVE" | "YOUTUBE" | "VIMEO" | "MATTERPORT";
  mediaId: string;
  title: string;
}>;

export function SafeExternalMedia({ provider, mediaId, title }: Props) {
  const [active, setActive] = useState(false);
  const urls = videoPlaybackUrls(provider, mediaId);
  if (!urls) return null;
  const src = urls.embed;
  return (
    <div className="safe-external-media">
      {active ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="fullscreen; picture-in-picture"
          className="h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} aria-label={`Load ${title}`}>
          <span aria-hidden="true">▶</span>
          <strong>{title}</strong>
          <small>Loads approved external media after you choose to play</small>
        </button>
      )}
    </div>
  );
}
