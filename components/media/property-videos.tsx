"use client";

import { useId, useState } from "react";
import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { useLanguage } from "@/components/public/language-provider";
import type { Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";
import { videoPlaybackUrls } from "@/lib/media/property-video";

type PlayerProps = {
  provider: string;
  mediaId: string;
  resourceKey?: string | null;
  title: string;
  posterUrl?: string | null;
  locale?: Locale;
};
export function PropertyVideoPlayer({
  provider,
  mediaId,
  resourceKey,
  title,
  posterUrl,
  locale = "en",
}: PlayerProps) {
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null);
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key];
  const urls = videoPlaybackUrls(provider, mediaId, resourceKey);
  if (!urls) return null;
  return (
    <div className="property-video-player">
      <div className="property-video-frame">
        {active ? (
          <iframe
            key={attempt}
            src={urls.embed}
            title={title}
            allowFullScreen
            allow="fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            onError={() => setActive(false)}
          />
        ) : (
          <button
            type="button"
            className="property-video-play"
            onClick={() => setActive(true)}
            aria-label={`${t("video.play")}: ${title}`}
          >
            {posterUrl && posterUrl !== failedPosterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl}
                alt=""
                loading="lazy"
                onError={() => setFailedPosterUrl(posterUrl ?? null)}
              />
            ) : (
              <span className="property-video-placeholder" aria-hidden="true">
                UrbanEdge
              </span>
            )}
            <span className="property-video-play-icon" aria-hidden="true">
              ▶
            </span>
            <span className="property-video-play-caption">{t("video.play")}</span>
          </button>
        )}
      </div>
      <div className="property-video-links">
        <a href={urls.external} target="_blank" rel="noopener noreferrer">
          {t(
            provider === "GOOGLE_DRIVE"
              ? "video.openDrive"
              : provider === "YOUTUBE"
                ? "video.openYoutube"
                : "video.openProvider",
          )}
        </a>
        <button
          type="button"
          onClick={() => {
            setAttempt(attempt + 1);
            setActive(true);
          }}
        >
          {t("video.retry")}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{t("video.help")}</p>
    </div>
  );
}

export function PropertyVideos({
  videos,
  coverPath,
  locale: suppliedLocale,
}: {
  videos: readonly PublicMediaDto[];
  coverPath?: string | null;
  locale?: Locale;
}) {
  const language = useLanguage();
  const locale = suppliedLocale ?? language.locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key];
  const headingId = useId();
  const [selection, setSelection] = useState<string | null>(null);
  const available = videos.filter(
    (v) =>
      v.mediaType === "VIDEO" &&
      videoPlaybackUrls(v.externalProvider ?? "", v.externalMediaId ?? "", v.driveResourceKey),
  );
  const selected = available.find((v) => v.id === selection) ?? available[0];
  if (!selected) return null;
  return (
    <section className="detail-section property-videos" aria-labelledby={headingId}>
      <h2 id={headingId} className="font-display text-2xl font-semibold">
        {t("video.heading")}
      </h2>
      <div className={`property-video-layout mt-5 ${available.length > 1 ? "has-choices" : ""}`}>
        <div className="min-w-0">
          <PropertyVideoPlayer
            key={`${selected.id}:${selected.externalMediaId}:${selected.driveResourceKey ?? ""}`}
            provider={selected.externalProvider!}
            mediaId={selected.externalMediaId!}
            resourceKey={selected.driveResourceKey}
            title={selected.videoTitle || selected.caption || t("video.heading")}
            posterUrl={buildPublicMediaUrl(selected.videoPosterPath ?? coverPath ?? null)}
            locale={locale}
          />
          <h3 className="mt-3 break-words font-semibold">
            {selected.videoTitle || selected.caption || t("video.heading")}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {selected.externalProvider === "GOOGLE_DRIVE"
              ? "Google Drive"
              : selected.externalProvider === "YOUTUBE"
                ? "YouTube"
                : selected.externalProvider}{" "}
            · {t(selected.mediaSubtype === "DRONE_VIDEO" ? "video.drone" : "video.standard")}
          </p>
          {selected.videoTitle && selected.caption ? (
            <p className="mt-2 break-words text-sm text-slate-600">{selected.caption}</p>
          ) : null}
        </div>
        {available.length > 1 ? (
          <div className="property-video-choices" role="group" aria-label={t("video.heading")}>
            {available.map((video, index) => (
              <button
                key={video.id}
                type="button"
                aria-pressed={video.id === selected.id}
                onClick={() => setSelection(video.id)}
                className="property-video-choice"
              >
                <span className="text-xs text-slate-500">
                  {index + 1} ·{" "}
                  {t(video.mediaSubtype === "DRONE_VIDEO" ? "video.drone" : "video.standard")}
                </span>
                <strong className="block break-words">
                  {video.videoTitle || video.caption || t("video.heading")}
                </strong>
                {video.id === selected.id ? (
                  <span className="text-xs font-bold">{t("video.selected")}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
