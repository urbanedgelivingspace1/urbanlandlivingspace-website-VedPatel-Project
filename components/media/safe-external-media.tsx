"use client";

import { useState } from "react";

type Props = Readonly<{
  provider: "YOUTUBE" | "VIMEO" | "MATTERPORT";
  mediaId: string;
  title: string;
}>;

export function SafeExternalMedia({ provider, mediaId, title }: Props) {
  const [active, setActive] = useState(false);
  if (!/^[a-zA-Z0-9_-]{5,80}$/.test(mediaId)) return null;
  const src =
    provider === "YOUTUBE"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(mediaId)}`
      : provider === "VIMEO"
        ? `https://player.vimeo.com/video/${encodeURIComponent(mediaId)}`
        : `https://my.matterport.com/show/?m=${encodeURIComponent(mediaId)}&play=1`;
  return (
    <div className="safe-external-media">
      {active ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
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
