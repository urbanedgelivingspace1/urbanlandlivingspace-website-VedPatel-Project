"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type {
  AdminMediaAssetDto,
  MediaFormState,
  VideoDraft,
} from "@/features/media/domain/contracts";
import { PropertyVideoPlayer } from "@/components/media/property-videos";
import type { Locale } from "@/lib/i18n/config";
import { dictionaries, type TranslationKey } from "@/lib/i18n/dictionaries";
import { MAX_PROPERTY_VIDEOS, parsePropertyVideo } from "@/lib/media/property-video";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";

type Props = {
  media: readonly AdminMediaAssetDto[];
  published: boolean;
  locale?: Locale;
  action: (state: MediaFormState, data: FormData) => Promise<MediaFormState>;
  onPendingChange?: (pending: boolean) => void;
};
type Editor = { mode: "create" | "edit" | "replace"; asset?: AdminMediaAssetDto };
export function PropertyVideoManager({
  media,
  published,
  locale = "en",
  action,
  onPendingChange,
}: Props) {
  const t = (key: TranslationKey) => dictionaries[locale][key];
  const videos = media
    .filter((v) => v.mediaType === "VIDEO")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const active = videos.filter((v) => !v.archivedAt);
  const archived = videos.filter((v) => v.archivedAt);
  const photos = media.filter((v) => v.mediaType === "IMAGE" && !v.archivedAt);
  const cover = photos.find((v) => v.isCover)?.previewUrl;
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isDirty, setDirty] = useState(false);
  const [navigationBlocked, setNavigationBlocked] = useState(false);
  const [result, setResult] = useState<MediaFormState>({ ok: false, message: "" });
  const [pending, startTransition] = useTransition();
  const submitting = useRef(false);
  const posterFor = (v: AdminMediaAssetDto) =>
    v.videoPosterUrl || photos.find((p) => p.id === v.videoPhotoId)?.previewUrl || cover;
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty && !pending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const beforeNavigation = (event: MouseEvent) => {
      if (
        (!isDirty && !pending) ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      setNavigationBlocked(true);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeNavigation, true);
    };
  }, [isDirty, pending]);
  function run(data: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    onPendingChange?.(true);
    startTransition(async () => {
      try {
        const next = await action({ ok: false, message: "" }, data);
        setResult(next);
        if (next.ok) {
          setEditor(null);
          setDirty(false);
          setNavigationBlocked(false);
        }
      } catch {
        setResult({ ok: false, message: t("video.error") });
      } finally {
        submitting.current = false;
        onPendingChange?.(false);
      }
    });
  }
  function mutate(asset: AdminMediaAssetDto, operation: string) {
    const data = new FormData();
    data.set("id", asset.id);
    data.set("revision", String(asset.videoRevision ?? 0));
    data.set("operation", operation);
    run(data);
  }
  return (
    <section
      className="property-video-manager rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      aria-label={t("video.heading")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{t("video.heading")}</h2>
        <button
          className="button button-primary"
          type="button"
          disabled={pending || isDirty || active.length >= MAX_PROPERTY_VIDEOS}
          onClick={() => setEditor({ mode: "create" })}
        >
          {t("video.add")}
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600">{t("video.intro")}</p>
      <p className="mt-2 font-semibold">
        {active.length} {t("video.count")}
      </p>
      <p className="mt-2 text-xs text-slate-500">{t("video.recommend")}</p>
      <p className="mt-2 text-xs text-slate-500">{t("video.savedNotice")}</p>
      {published ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          {t("video.liveWarning")}
        </p>
      ) : null}
      {navigationBlocked ? (
        <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
          {t(pending ? "video.saving" : "video.unsaved")}
        </p>
      ) : null}
      {result.message ? (
        <p
          role={result.ok ? "status" : "alert"}
          className={`mt-3 text-sm ${result.ok ? "text-emerald-800" : "text-red-800"}`}
        >
          {result.ok ? t("video.saved") : `${t("video.error")} ${result.message}`}
        </p>
      ) : null}
      {editor ? (
        <VideoEditor
          key={`${editor.mode}:${editor.asset?.id ?? "new"}`}
          editor={editor}
          photos={photos}
          locale={locale}
          pending={pending}
          onSubmit={run}
          onDirtyChange={setDirty}
          onCancel={() => {
            setEditor(null);
            setDirty(false);
            setNavigationBlocked(false);
          }}
        />
      ) : null}
      <div className="mt-5 space-y-4">
        {active.map((video, index) => (
          <article className="property-video-admin-card" key={video.id}>
            <div className="min-w-0">
              <PropertyVideoPlayer
                key={`${video.id}:${video.externalMediaId}`}
                provider={video.externalProvider ?? ""}
                mediaId={video.externalMediaId ?? ""}
                resourceKey={video.driveResourceKey}
                title={video.videoTitle || video.caption || t("video.heading")}
                posterUrl={posterFor(video)}
                locale={locale}
              />
              <p className="mt-1 text-xs text-slate-500">{t("video.fallback")}</p>
            </div>
            <div className="min-w-0">
              <h3 className="break-words font-semibold">
                {video.videoTitle || video.caption || t("video.heading")}
              </h3>
              {video.videoTitle && video.caption ? (
                <p className="mt-2 break-words text-sm text-slate-600">{video.caption}</p>
              ) : null}
              <p className="mt-2 text-sm">
                {video.externalProvider === "GOOGLE_DRIVE"
                  ? "Google Drive"
                  : video.externalProvider === "YOUTUBE"
                    ? "YouTube"
                    : video.externalProvider}{" "}
                · {t(video.mediaSubtype === "DRONE_VIDEO" ? "video.drone" : "video.standard")}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {t(
                  video.processingStatus === "APPROVED" && video.visibility === "PUBLIC"
                    ? published
                      ? "video.visible"
                      : "video.approved"
                    : "video.hidden",
                )}
              </p>
              <p className="text-xs text-slate-500">
                {t("video.position")} {index + 1}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={pending || isDirty}
                  onClick={() => setEditor({ mode: "edit", asset: video })}
                >
                  {t("video.edit")}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={pending || isDirty}
                  onClick={() => setEditor({ mode: "replace", asset: video })}
                >
                  {t("video.replace")}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={pending || isDirty || index === 0}
                  onClick={() => mutate(video, "earlier")}
                >
                  {t("video.earlier")}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={pending || isDirty || index === active.length - 1}
                  onClick={() => mutate(video, "later")}
                >
                  {t("video.later")}
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={pending || isDirty}
                  onClick={() => mutate(video, video.visibility === "PUBLIC" ? "hide" : "approve")}
                >
                  {t(video.visibility === "PUBLIC" ? "video.hide" : "video.approve")}
                </button>
                <button
                  type="button"
                  className="button button-secondary text-red-800"
                  disabled={pending || isDirty}
                  onClick={() => mutate(video, "archive")}
                >
                  {t("video.remove")}
                </button>
              </div>
              {video.pendingVideo ? (
                <div className="mt-4 space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm font-semibold">{t("video.pending")}</p>
                  <p className="break-words font-semibold">{video.pendingVideo.title}</p>
                  <DraftPlayer
                    draft={video.pendingVideo}
                    locale={locale}
                    fallback={
                      photos.find((p) => p.id === video.pendingVideo?.photoId)?.previewUrl || cover
                    }
                  />
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={pending || isDirty}
                    onClick={() => mutate(video, "approve")}
                  >
                    {t("video.approveReplacement")}
                  </button>{" "}
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={pending || isDirty}
                    onClick={() => mutate(video, "discard")}
                  >
                    {t("video.discard")}
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {archived.length ? (
        <details className="mt-5">
          <summary className="min-h-11 cursor-pointer font-semibold">
            {t("video.archived")} ({archived.length})
          </summary>
          <div className="space-y-3">
            {archived.map((video) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                key={video.id}
              >
                <span className="break-words">
                  {video.videoTitle || video.caption || t("video.heading")} ·{" "}
                  {t("video.archiveStatus")}
                </span>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={pending || isDirty || active.length >= MAX_PROPERTY_VIDEOS}
                  onClick={() => mutate(video, "restore")}
                >
                  {t("video.restore")}
                </button>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function DraftPlayer({
  draft,
  locale,
  fallback,
}: {
  draft: VideoDraft;
  locale: Locale;
  fallback?: string | null;
}) {
  return (
    <PropertyVideoPlayer
      key={draft.canonicalUrl}
      provider={draft.provider}
      mediaId={draft.mediaId}
      resourceKey={draft.resourceKey}
      title={draft.title}
      posterUrl={buildPublicMediaUrl(draft.poster?.path ?? null) || fallback}
      locale={locale}
    />
  );
}
function VideoEditor({
  editor,
  photos,
  locale,
  pending,
  onSubmit,
  onDirtyChange,
  onCancel,
}: {
  editor: Editor;
  photos: readonly AdminMediaAssetDto[];
  locale: Locale;
  pending: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const t = (key: TranslationKey) => dictionaries[locale][key];
  const asset = editor.asset;
  const [url, setUrl] = useState(editor.mode === "edit" ? (asset?.externalUrl ?? "") : "");
  const [title, setTitle] = useState(asset?.videoTitle || asset?.caption || "");
  const [description, setDescription] = useState(asset?.videoTitle ? (asset.caption ?? "") : "");
  const [subtype, setSubtype] = useState(asset?.mediaSubtype || "STANDARD_VIDEO");
  const [photoId, setPhotoId] = useState(asset?.videoPhotoId || "");
  const [clearPoster, setClearPoster] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    },
    [screenshotUrl],
  );
  const source = parsePropertyVideo(url);
  const fallback =
    photos.find((p) => p.id === photoId)?.previewUrl || photos.find((p) => p.isCover)?.previewUrl;
  return (
    <form
      className="mt-5 space-y-4 rounded-xl border border-slate-300 bg-slate-50 p-4"
      onChangeCapture={() => onDirtyChange(true)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <input type="hidden" name="operation" value={editor.mode} />
      {asset ? (
        <>
          <input type="hidden" name="id" value={asset.id} />
          <input type="hidden" name="revision" value={asset.videoRevision ?? 0} />
        </>
      ) : null}
      <h3 className="font-semibold">
        {t(
          editor.mode === "create"
            ? "video.add"
            : editor.mode === "edit"
              ? "video.edit"
              : "video.replace",
        )}
      </h3>
      <label>
        {t("video.url")}
        <input
          name="url"
          type="url"
          required
          value={url}
          readOnly={editor.mode === "edit"}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      {source ? (
        <p className="text-sm text-slate-600">
          {t(source.provider === "GOOGLE_DRIVE" ? "video.driveHelp" : "video.youtubeHelp")}
        </p>
      ) : url && editor.mode !== "edit" ? (
        <p className="text-sm text-red-800">{t("video.invalid")}</p>
      ) : null}
      <label>
        {t("video.title")}
        <input
          name="title"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        {t("video.type")}
        <select name="subtype" value={subtype} onChange={(e) => setSubtype(e.target.value)}>
          <option value="STANDARD_VIDEO">{t("video.standard")}</option>
          <option value="DRONE_VIDEO">{t("video.drone")}</option>
        </select>
      </label>
      <label>
        {t("video.description")}
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        {t("video.photo")}
        <select name="photoId" value={photoId} onChange={(e) => setPhotoId(e.target.value)}>
          <option value="">{t("video.cover")}</option>
          {photos.map((photo, index) => (
            <option value={photo.id} key={photo.id}>
              {photo.altText || `${index + 1}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("video.screenshot")}
        <input
          name="poster"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setScreenshotUrl(file ? URL.createObjectURL(file) : null);
            if (file) setClearPoster(false);
          }}
        />
      </label>
      {editor.mode === "edit" && asset?.videoPosterId ? (
        <label>
          <input
            name="clearPoster"
            type="checkbox"
            checked={clearPoster}
            onChange={(event) => setClearPoster(event.target.checked)}
          />{" "}
          {t("video.clearPoster")}
        </label>
      ) : null}
      {source ? (
        <PropertyVideoPlayer
          key={source.canonicalUrl}
          provider={source.provider}
          mediaId={source.mediaId}
          resourceKey={source.resourceKey}
          title={title || t("video.preview")}
          posterUrl={
            screenshotUrl ||
            (editor.mode === "edit" && !clearPoster ? asset?.videoPosterUrl : null) ||
            fallback
          }
          locale={locale}
        />
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          className="button button-primary"
          disabled={pending || (editor.mode !== "edit" && !source)}
        >
          {t(
            pending
              ? "video.saving"
              : editor.mode === "create"
                ? "video.save"
                : editor.mode === "replace"
                  ? "video.saveReplacement"
                  : "video.saveEdit",
          )}
        </button>
        <button
          type="button"
          className="button button-secondary"
          disabled={pending}
          onClick={onCancel}
        >
          {t("video.cancel")}
        </button>
      </div>
    </form>
  );
}
