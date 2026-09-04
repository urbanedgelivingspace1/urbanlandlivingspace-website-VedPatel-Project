"use client";

import { useState } from "react";

import { ShareIcon } from "./icons";

export function ShareButton({
  title,
  propertyCode,
}: Readonly<{ title: string; propertyCode: string }>) {
  const [message, setMessage] = useState("Share");

  async function share() {
    const data = { title, text: `${title} — ${propertyCode}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Link copied");
      }
    } catch {
      setMessage("Share");
    }
  }

  return (
    <button type="button" className="share-button" onClick={share}>
      <ShareIcon className="size-4" /> {message}
    </button>
  );
}
