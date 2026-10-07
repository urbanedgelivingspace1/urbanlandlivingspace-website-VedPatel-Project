"use client";

import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { flushSync, useFormStatus } from "react-dom";

import { PropertyWorkflowNavigation } from "@/components/admin/property-workflow";
import type {
  AdminMediaAssetDto,
  BatchPhotoUploadResult,
  MediaFormState,
} from "@/features/media/domain/contracts";
import { buildPublicBrochureUrl } from "@/lib/media/public-media-url";

const EMPTY_MEDIA_STATE: MediaFormState = { ok: false, message: "" };
const EMPTY_BATCH_STATE: BatchPhotoUploadResult = {
  ok: false,
  uploaded: 0,
  results: [],
  message: "",
};

type MediaAction = (state: MediaFormState, data: FormData) => Promise<MediaFormState>;
type BatchAction = (
  state: BatchPhotoUploadResult,
  data: FormData,
) => Promise<BatchPhotoUploadResult>;

type Props = Readonly<{
  propertyId: string;
  media: readonly AdminMediaAssetDto[];
  activeMediaIds: readonly string[];
  uploadImagesAction: BatchAction;
  saveBrochureAction: MediaAction;
  updateMetadataAction: (data: FormData) => Promise<void>;
  reorderAction: (data: FormData) => Promise<void>;
  setCoverAction: (data: FormData) => Promise<void>;
  approveAction: (data: FormData) => Promise<void>;
  archiveMediaAction: (data: FormData) => Promise<void>;
}>;

const PendingOperationContext = createContext<(operationId: string, pending: boolean) => void>(
  () => undefined,
);

function usePendingOperation(pending: boolean) {
  const operationId = useId();
  const reportPending = useContext(PendingOperationContext);
  useEffect(() => {
    reportPending(operationId, pending);
    return () => reportPending(operationId, false);
  }, [operationId, pending, reportPending]);
}

function Submit({
  children,
  className = "button button-primary disabled:opacity-60",
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  const { pending } = useFormStatus();
  usePendingOperation(pending);
  return (
    <button disabled={pending} className={className}>
      {pending ? "Working…" : children}
    </button>
  );
}

function selectedFiles(input: HTMLInputElement | null) {
  return input?.files ? Array.from(input.files) : [];
}

function PhotoUploader({ action }: Readonly<{ action: BatchAction }>) {
  const inputId = useId();
  const operationId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reportPending = useContext(PendingOperationContext);
  const [files, setFiles] = useState<readonly File[]>([]);
  const [dragging, setDragging] = useState(false);
  const trackedAction = useCallback(
    async (previousState: BatchPhotoUploadResult, data: FormData) => {
      reportPending(operationId, true);
      try {
        const result = await action(previousState, data);
        setFiles([]);
        formRef.current?.reset();
        return result;
      } finally {
        reportPending(operationId, false);
      }
    },
    [action, operationId, reportPending],
  );
  const [state, formAction, pending] = useActionState(trackedAction, EMPTY_BATCH_STATE);
  usePendingOperation(pending);

  function receiveDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!inputRef.current || !event.dataTransfer.files.length) return;
    const transfer = new DataTransfer();
    for (const file of Array.from(event.dataTransfer.files)) transfer.items.add(file);
    inputRef.current.files = transfer.files;
    setFiles(Array.from(transfer.files));
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={() => flushSync(() => reportPending(operationId, true))}
      className="mt-5 space-y-4"
    >
      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={receiveDrop}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--brand-gold-deep)] ${
          dragging ? "border-[var(--brand-gold-deep)] bg-amber-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        <span
          className="grid size-12 place-items-center rounded-full bg-white text-2xl shadow-sm"
          aria-hidden="true"
        >
          ↑
        </span>
        <span className="mt-3 text-base font-bold text-slate-950">Drag photos here</span>
        <span className="mt-1 text-sm text-slate-600">or</span>
        <span className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#02066f] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#01043d] transition-colors">
          Choose Photos
        </span>
        <input
          ref={inputRef}
          id={inputId}
          name="files"
          type="file"
          aria-label="Choose property photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          className="sr-only"
          onChange={() => setFiles(selectedFiles(inputRef.current))}
        />
        <span className="mt-4 text-xs text-slate-500">
          JPEG, PNG or WebP · Maximum 10 MB per image and 50 MB per batch
        </span>
      </label>

      {files.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-bold" aria-live="polite">
            {files.length} {files.length === 1 ? "photo" : "photos"} selected
          </p>
          <ul className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="truncate">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        className="button button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={pending || files.length === 0}
      >
        {pending
          ? `Uploading and processing ${files.length} ${files.length === 1 ? "photo" : "photos"}…`
          : files.length
            ? `Upload ${files.length} ${files.length === 1 ? "Photo" : "Photos"}`
            : "Upload Photos"}
      </button>

      {state.message ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border p-4 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-bold">{state.message}</p>
          {state.results.length ? (
            <ul className="mt-2 space-y-1">
              {state.results.map((result, index) => (
                <li key={`${result.fileName}-${index}`} className="flex gap-2">
                  <span aria-hidden="true">{result.ok ? "✓" : "✕"}</span>
                  <span className="min-w-0 break-words">
                    <strong>{result.fileName}</strong> — {result.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export function PropertyMediaManager(props: Props) {
  const [pendingOperations, setPendingOperations] = useState<ReadonlySet<string>>(() => new Set());
  const reportPending = useCallback((operationId: string, pending: boolean) => {
    setPendingOperations((current) => {
      if (current.has(operationId) === pending) return current;
      const next = new Set(current);
      if (pending) next.add(operationId);
      else next.delete(operationId);
      return next;
    });
  }, []);
  const active = props.media
    .filter((asset) => !asset.archivedAt)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const photos = active.filter((asset) => asset.mediaType === "IMAGE");
  const brochure = active.find((asset) => asset.mediaType === "BROCHURE") ?? null;

  return (
    <PendingOperationContext.Provider value={reportPending}>
      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            Property photos
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Upload Photos</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select several photos at once. They are checked and prepared automatically before being
            added to the listing.
          </p>
          <PhotoUploader action={props.uploadImagesAction} />
        </section>

        <PhotoGallery
          propertyId={props.propertyId}
          photos={photos}
          activeMediaIds={props.activeMediaIds}
          updateMetadataAction={props.updateMetadataAction}
          reorderAction={props.reorderAction}
          setCoverAction={props.setCoverAction}
          approveAction={props.approveAction}
          archiveMediaAction={props.archiveMediaAction}
        />

        <BrochureSection
          propertyId={props.propertyId}
          brochure={brochure}
          saveAction={props.saveBrochureAction}
          approveAction={props.approveAction}
          removeAction={props.archiveMediaAction}
        />

        <PropertyWorkflowNavigation
          previousHref={`/admin/properties/${props.propertyId}/edit`}
          previousLabel="Property Details"
          secondaryHref={`/admin/properties/${props.propertyId}`}
          secondaryLabel="Keep as Draft"
          nextHref={`/admin/properties/${props.propertyId}/preview`}
          nextLabel="Save & Next"
          nextDisabledReason={
            pendingOperations.size
              ? "Wait for the current upload or media change to finish before continuing."
              : undefined
          }
        />
      </div>
    </PendingOperationContext.Provider>
  );
}

function PhotoGallery({
  propertyId,
  photos,
  activeMediaIds,
  updateMetadataAction,
  reorderAction,
  setCoverAction,
  approveAction,
  archiveMediaAction,
}: Readonly<{
  propertyId: string;
  photos: readonly AdminMediaAssetDto[];
  activeMediaIds: readonly string[];
  updateMetadataAction: (data: FormData) => Promise<void>;
  reorderAction: (data: FormData) => Promise<void>;
  setCoverAction: (data: FormData) => Promise<void>;
  approveAction: (data: FormData) => Promise<void>;
  archiveMediaAction: (data: FormData) => Promise<void>;
}>) {
  if (photos.length === 0) {
    return (
      <section aria-labelledby="photo-gallery-heading">
        <h2 id="photo-gallery-heading" className="font-display text-2xl font-semibold">
          Photo Gallery
        </h2>
        <p className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No photos added yet. Select multiple photos above or drag them into the upload area.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="photo-gallery-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="photo-gallery-heading" className="font-display text-2xl font-semibold">
            Photo Gallery
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose the cover, adjust the order, or remove a photo.
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, photoIndex) => {
          const allIds = [...activeMediaIds];
          const mediaIndex = activeMediaIds.indexOf(photo.id);
          const previousPhoto = photos[photoIndex - 1];
          const nextPhoto = photos[photoIndex + 1];
          const earlierIds = previousPhoto
            ? swap(allIds, mediaIndex, activeMediaIds.indexOf(previousPhoto.id))
            : null;
          const laterIds = nextPhoto
            ? swap(allIds, mediaIndex, activeMediaIds.indexOf(nextPhoto.id))
            : null;
          const needsApproval = photo.processingStatus === "READY";
          const failed = photo.processingStatus === "FAILED";

          return (
            <article
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {photo.previewUrl ? (
                  // Private signed previews are dynamic and cannot be statically allowlisted.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.previewUrl}
                    alt={photo.altText || `Property photo ${photoIndex + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-500">
                    Photo preview unavailable
                  </div>
                )}
                {photo.isCover ? (
                  <span className="absolute top-3 left-3 rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow">
                    ✓ Cover Photo
                  </span>
                ) : null}
                {failed ? (
                  <span className="absolute top-3 right-3 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
                    Needs attention
                  </span>
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <h3 className="font-bold">Photo {photoIndex + 1}</h3>
                {needsApproval ? (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                    <p className="font-semibold">Ready to add to the listing</p>
                    <SimpleAction
                      action={approveAction}
                      propertyId={propertyId}
                      name="mediaId"
                      value={photo.id}
                      label="Add to Listing"
                    />
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {!photo.isCover && photo.processingStatus === "APPROVED" ? (
                    <SimpleAction
                      action={setCoverAction}
                      propertyId={propertyId}
                      name="mediaId"
                      value={photo.id}
                      label="Set as Cover"
                    />
                  ) : null}
                  {earlierIds ? (
                    <OrderAction
                      action={reorderAction}
                      propertyId={propertyId}
                      ids={earlierIds}
                      label="Move Earlier"
                    />
                  ) : null}
                  {laterIds ? (
                    <OrderAction
                      action={reorderAction}
                      propertyId={propertyId}
                      ids={laterIds}
                      label="Move Later"
                    />
                  ) : null}
                  <SimpleAction
                    action={archiveMediaAction}
                    propertyId={propertyId}
                    name="mediaId"
                    value={photo.id}
                    label="Remove"
                    danger
                  />
                </div>
                <details className="border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-sm font-bold text-slate-700">
                    Edit photo details
                  </summary>
                  <form action={updateMetadataAction} className="mt-3 space-y-2">
                    <input type="hidden" name="propertyId" value={propertyId} />
                    <input type="hidden" name="mediaId" value={photo.id} />
                    <label className="block text-xs font-bold text-slate-700">
                      Image description
                      <input
                        name="altText"
                        defaultValue={photo.altText ?? ""}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-bold text-slate-700">
                      Caption (optional)
                      <input
                        name="caption"
                        defaultValue={photo.caption ?? ""}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    <Submit className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold disabled:opacity-60">
                      Save Details
                    </Submit>
                  </form>
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BrochureSection({
  propertyId,
  brochure,
  saveAction,
  approveAction,
  removeAction,
}: Readonly<{
  propertyId: string;
  brochure: AdminMediaAssetDto | null;
  saveAction: MediaAction;
  approveAction: (data: FormData) => Promise<void>;
  removeAction: (data: FormData) => Promise<void>;
}>) {
  const operationId = useId();
  const reportPending = useContext(PendingOperationContext);
  const [replacing, setReplacing] = useState(false);
  const trackedAction = useCallback(
    async (previousState: MediaFormState, data: FormData) => {
      reportPending(operationId, true);
      try {
        return await saveAction(previousState, data);
      } finally {
        reportPending(operationId, false);
      }
    },
    [operationId, reportPending, saveAction],
  );
  const [state, formAction, pending] = useActionState(trackedAction, EMPTY_MEDIA_STATE);
  usePendingOperation(pending);
  const downloadUrl = brochure ? buildPublicBrochureUrl(brochure) : null;
  const showForm = !brochure || replacing;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-[var(--brand-gold-deep)] uppercase">
            Brochure · Optional
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Property Brochure</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Upload the brochure PDF to Google Drive, set access to “Anyone with the link” and
            “Viewer”, then paste the sharing link below.
          </p>
        </div>
        <a
          href="https://drive.google.com/"
          target="_blank"
          rel="noreferrer"
          className="button button-secondary justify-center"
        >
          Open Google Drive ↗
        </a>
      </div>

      {brochure ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-bold text-emerald-900">✓ Brochure connected</p>
          <p className="mt-1 text-sm text-emerald-900">
            {brochure.externalProvider === "GOOGLE_DRIVE"
              ? "Google Drive brochure"
              : "Existing hosted brochure"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {downloadUrl && brochure.processingStatus === "APPROVED" ? (
              <a
                className="button button-secondary"
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Test Download
              </a>
            ) : null}
            {brochure.processingStatus === "READY" ? (
              <SimpleAction
                action={approveAction}
                propertyId={propertyId}
                name="mediaId"
                value={brochure.id}
                label="Add to Listing"
              />
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
              onClick={() => setReplacing((current) => !current)}
            >
              {replacing ? "Cancel Replace" : "Replace Link"}
            </button>
            <SimpleAction
              action={removeAction}
              propertyId={propertyId}
              name="mediaId"
              value={brochure.id}
              label="Remove Brochure"
              danger
            />
          </div>
        </div>
      ) : null}

      {showForm ? (
        <form
          action={formAction}
          onSubmit={() => flushSync(() => reportPending(operationId, true))}
          className="mt-5 space-y-3"
        >
          <label className="block text-sm font-bold text-slate-800">
            Google Drive brochure link
            <input
              name="brochureUrl"
              type="url"
              inputMode="url"
              required
              placeholder="https://drive.google.com/file/d/.../view"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
            />
          </label>
          <p className="text-xs text-slate-500">
            The Drive file must be shared as Anyone with the link — Viewer. Folder links are not
            supported.
          </p>
          <button
            disabled={pending}
            className="button button-primary w-full justify-center disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Saving Brochure…" : brochure ? "Save Replacement" : "Save Brochure"}
          </button>
          {state.message ? (
            <p
              role="status"
              className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-red-700"}`}
            >
              {state.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}

function swap(values: readonly string[], left: number, right: number) {
  const next = [...values];
  [next[left], next[right]] = [next[right] as string, next[left] as string];
  return next;
}

function SimpleAction({
  action,
  propertyId,
  name,
  value,
  label,
  danger = false,
}: Readonly<{
  action: (data: FormData) => Promise<void>;
  propertyId: string;
  name: string;
  value: string;
  label: string;
  danger?: boolean;
}>) {
  return (
    <form action={action}>
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name={name} value={value} />
      <Submit
        className={`rounded-lg border bg-white px-3 py-2 text-xs font-bold disabled:opacity-60 ${
          danger ? "border-red-300 text-red-800" : "border-slate-300 text-slate-900"
        }`}
      >
        {label}
      </Submit>
    </form>
  );
}

function OrderAction({
  action,
  propertyId,
  ids,
  label,
}: Readonly<{
  action: (data: FormData) => Promise<void>;
  propertyId: string;
  ids: readonly string[];
  label: string;
}>) {
  return (
    <form action={action}>
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="mediaIds" value={ids.join(",")} />
      <Submit className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-60">
        {label}
      </Submit>
    </form>
  );
}
