"use client";

import { useEffect, useId, useState } from "react";
import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { useLanguage } from "@/components/public/language-provider";
import type { Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";
import {
  isPlayablePropertyVideo,
  videoPlaybackUrls,
  youtubeThumbnailUrls,
} from "@/lib/media/property-video";

function useAdminDriveThumbnail(url: string | undefined) {
  const [thumbnail, setThumbnail] = useState<{ url: string; image: string } | null>(null);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let image: string | undefined;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/video-thumbnails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        image = URL.createObjectURL(blob);
        setThumbnail({ url, image });
      } catch {
        // The player uses its existing image fallback if the provider is unavailable.
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
      if (image) URL.revokeObjectURL(image);
    };
  }, [url]);
  return url && thumbnail?.url === url ? thumbnail.image : null;
}

type PlayerProps = {
  provider: string;
  mediaId: string;
  resourceKey?: string | null;
  title: string;
  posterUrl?: string | null;
  coverUrl?: string | null;
  publicVideoId?: string;
  adminPreview?: boolean;
  locale?: Locale;
};
export function PropertyVideoPlayer({
  provider,
  mediaId,
  resourceKey,
  title,
  posterUrl,
  coverUrl,
  publicVideoId,
  adminPreview,
  locale = "en",
}: PlayerProps) {
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key];
  const urls = videoPlaybackUrls(provider, mediaId, resourceKey);
  const isDrive = provider === "GOOGLE_DRIVE";
  const adminImage = useAdminDriveThumbnail(adminPreview && isDrive ? urls?.external : undefined);
  const providerImages =
    provider === "YOUTUBE"
      ? youtubeThumbnailUrls(mediaId)
      : isDrive && publicVideoId
        ? [
            `/api/public/video-thumbnails/${encodeURIComponent(publicVideoId)}?file=${encodeURIComponent(mediaId)}`,
          ]
        : [adminImage];
  const previewImage = [...providerImages, posterUrl, coverUrl].find((image): image is string =>
    Boolean(image && !failedImages.includes(image)),
  );
  function markImageFailed(image: string) {
    setFailedImages((images) => (images.includes(image) ? images : [...images, image]));
  }

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
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={previewImage}
                ref={(image) => {
                  // The server-rendered image can fail before React attaches onError.
                  if (image?.complete && image.naturalWidth === 0) markImageFailed(previewImage);
                }}
                src={previewImage}
                alt=""
                loading="lazy"
                referrerPolicy={providerImages.includes(previewImage) ? "no-referrer" : undefined}
                onError={() => markImageFailed(previewImage)}
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
  id,
  videos,
  coverPath,
  locale: suppliedLocale,
  adminPreview = false,
}: {
  id?: string;
  videos: readonly PublicMediaDto[];
  coverPath?: string | null;
  locale?: Locale;
  adminPreview?: boolean;
}) {
  const language = useLanguage();
  const locale = suppliedLocale ?? language.locale;
  const t = (key: keyof typeof dictionaries.en) => dictionaries[locale][key];
  const headingId = useId();
  const [selection, setSelection] = useState<string | null>(null);
  const available = videos.filter(isPlayablePropertyVideo);
  const selected = available.find((v) => v.id === selection) ?? available[0];
  if (!selected) return null;
  const usePropertyImages = adminPreview || selected.externalProvider !== "YOUTUBE";
  return (
    <section
      id={id}
      className="detail-section property-videos scroll-mt-24"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="font-display text-2xl font-semibold">
        {t("video.heading")}
      </h2>
      <div className={`property-video-layout mt-5 ${available.length > 1 ? "has-choices" : ""}`}>
        <div className="min-w-0">
          <PropertyVideoPlayer
            key={`${selected.id}:${selected.externalMediaId}:${selected.driveResourceKey ?? ""}`}
            provider={selected.externalProvider}
            mediaId={selected.externalMediaId}
            resourceKey={selected.driveResourceKey}
            title={selected.videoTitle || selected.caption || t("video.heading")}
            posterUrl={
              usePropertyImages ? buildPublicMediaUrl(selected.videoPosterPath ?? null) : null
            }
            coverUrl={usePropertyImages ? buildPublicMediaUrl(coverPath ?? null) : null}
            publicVideoId={adminPreview ? undefined : selected.id}
            adminPreview={adminPreview}
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
