"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type {
  AdminMediaAssetDto,
  AdminPrivateDocumentDto,
  MediaFormState,
} from "@/features/media/domain/contracts";
import { SafeExternalMedia } from "@/components/media/safe-external-media";

const EMPTY: MediaFormState = { ok: false, message: "" };
type StatefulAction = (state: MediaFormState, data: FormData) => Promise<MediaFormState>;

type Props = Readonly<{
  propertyId: string;
  media: readonly AdminMediaAssetDto[];
  documents: readonly AdminPrivateDocumentDto[];
  uploadImageAction: StatefulAction;
  uploadBrochureAction: StatefulAction;
  uploadPrivateDocumentAction: StatefulAction;
  addExternalMediaAction: StatefulAction;
  updateMetadataAction: (data: FormData) => Promise<void>;
  reorderAction: (data: FormData) => Promise<void>;
  setCoverAction: (data: FormData) => Promise<void>;
  approveAction: (data: FormData) => Promise<void>;
  archiveMediaAction: (data: FormData) => Promise<void>;
  restoreMediaAction: (data: FormData) => Promise<void>;
  archiveDocumentAction: (data: FormData) => Promise<void>;
}>;

function Submit({ children }: Readonly<{ children: React.ReactNode }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-[var(--brand-navy)] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

function UploadForm({
  action,
  title,
  accept,
  children,
}: Readonly<{
  action: StatefulAction;
  title: string;
  accept: string;
  children?: React.ReactNode;
}>) {
  const [state, formAction] = useActionState(action, EMPTY);
  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <input name="file" type="file" accept={accept} required className="block w-full text-sm" />
      {children}
      <Submit>Upload</Submit>
      {state.message ? (
        <p role="status" className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function PropertyMediaManager(props: Props) {
  const [externalState, externalAction] = useActionState(props.addExternalMediaAction, EMPTY);
  const active = props.media.filter((asset) => !asset.archivedAt);
  const archived = props.media.filter((asset) => asset.archivedAt);
  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <UploadForm
          action={props.uploadImageAction}
          title="Upload gallery image"
          accept="image/jpeg,image/png,image/webp"
        >
          <input
            name="altText"
            placeholder="Truthful alt text (required before approval)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="caption"
            placeholder="Optional caption"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500">
            JPEG/PNG/WebP, max 10 MB. Stored as metadata-stripped WebP in private staging.
          </p>
        </UploadForm>
        <UploadForm
          action={props.uploadBrochureAction}
          title="Upload public brochure candidate"
          accept="application/pdf"
        >
          <p className="text-xs text-slate-500">
            Marketing PDF only, max 15 MB/40 pages. Legal evidence belongs under Private evidence.
          </p>
        </UploadForm>
        <UploadForm
          action={props.uploadPrivateDocumentAction}
          title="Upload private evidence"
          accept="application/pdf,image/jpeg,image/png"
        >
          <select
            name="documentType"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="OWNER_DOCUMENT">Owner document</option>
            <option value="LEGAL_DOCUMENT">Legal document</option>
            <option value="VERIFICATION_EVIDENCE">Future verification evidence</option>
          </select>
          <p className="text-xs text-slate-500">
            Private bucket only. Pending/failed scans cannot be opened or trusted as evidence.
          </p>
        </UploadForm>
      </section>

      <form
        action={externalAction}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[12rem_1fr_1fr_auto]"
      >
        <label className="text-sm font-semibold">
          External media
          <select
            name="kind"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
          >
            <option value="VIDEO">YouTube/Vimeo</option>
            <option value="DRONE_VIDEO">Drone video URL</option>
            <option value="PANORAMA_360">Matterport 360</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          HTTPS URL
          <input
            name="externalUrl"
            type="url"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Caption
          <input
            name="caption"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <div className="self-end">
          <Submit>Add URL</Submit>
        </div>
        {externalState.message ? (
          <p
            role="status"
            className={`text-sm md:col-span-4 ${externalState.ok ? "text-emerald-700" : "text-red-700"}`}
          >
            {externalState.message}
          </p>
        ) : null}
      </form>

      <section>
        <h2 className="font-display text-2xl font-semibold">Gallery and public media</h2>
        <p className="mt-1 text-sm text-slate-600">
          Assets are private until an explicit approval copies them to the public bucket. Property
          publication remains unavailable until M9.
        </p>
        {active.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
            No media yet. Upload an image, brochure, or approved external URL to begin.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((asset, index) => {
              const before = active.map((item) => item.id);
              const up = [...before];
              if (index > 0) {
                const current = up[index] as string;
                up[index] = up[index - 1] as string;
                up[index - 1] = current;
              }
              const down = [...before];
              if (index < active.length - 1) {
                const current = down[index] as string;
                down[index] = down[index + 1] as string;
                down[index + 1] = current;
              }
              return (
                <article
                  key={asset.id}
                  className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[12rem_1fr_auto]"
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-center text-xs text-slate-500">
                    {asset.previewUrl && asset.mediaType === "IMAGE" ? (
                      // Signed private previews cannot be statically allowlisted for next/image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.previewUrl}
                        alt={asset.altText || "Admin media preview"}
                        className="h-full w-full object-cover"
                      />
                    ) : asset.externalProvider &&
                      asset.externalMediaId &&
                      ["YOUTUBE", "VIMEO", "MATTERPORT"].includes(asset.externalProvider) ? (
                      <SafeExternalMedia
                        provider={asset.externalProvider as "YOUTUBE" | "VIMEO" | "MATTERPORT"}
                        mediaId={asset.externalMediaId}
                        title={asset.caption || `${asset.externalProvider} property media`}
                      />
                    ) : (
                      asset.mediaType
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                      <span>{asset.mediaSubtype || asset.mediaType}</span>
                      <span>{asset.processingStatus}</span>
                      <span>{asset.visibility}</span>
                      {asset.isCover ? <span className="text-emerald-700">Cover</span> : null}
                    </div>
                    <form
                      action={props.updateMetadataAction}
                      className="mt-3 grid gap-2 sm:grid-cols-2"
                    >
                      <input type="hidden" name="propertyId" value={props.propertyId} />
                      <input type="hidden" name="mediaId" value={asset.id} />
                      <input
                        name="altText"
                        defaultValue={asset.altText ?? ""}
                        placeholder="Alt text"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name="caption"
                        defaultValue={asset.caption ?? ""}
                        placeholder="Caption"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button className="w-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">
                        Save metadata
                      </button>
                    </form>
                  </div>
                  <div className="flex flex-wrap content-start gap-2 lg:w-40">
                    {asset.processingStatus === "READY" ? (
                      <SimpleAction
                        action={props.approveAction}
                        propertyId={props.propertyId}
                        name="mediaId"
                        value={asset.id}
                        label="Approve / promote"
                      />
                    ) : null}
                    {asset.mediaType === "IMAGE" &&
                    asset.processingStatus === "APPROVED" &&
                    !asset.isCover ? (
                      <SimpleAction
                        action={props.setCoverAction}
                        propertyId={props.propertyId}
                        name="mediaId"
                        value={asset.id}
                        label="Set cover"
                      />
                    ) : null}
                    {index > 0 ? (
                      <OrderAction
                        action={props.reorderAction}
                        propertyId={props.propertyId}
                        ids={up}
                        label="Move up"
                      />
                    ) : null}
                    {index < active.length - 1 ? (
                      <OrderAction
                        action={props.reorderAction}
                        propertyId={props.propertyId}
                        ids={down}
                        label="Move down"
                      />
                    ) : null}
                    <SimpleAction
                      action={props.archiveMediaAction}
                      propertyId={props.propertyId}
                      name="mediaId"
                      value={asset.id}
                      label="Archive"
                      danger
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Private evidence</h2>
        {props.documents.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No private documents stored.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Document</th>
                  <th className="p-3">Scan</th>
                  <th className="p-3">Access</th>
                  <th className="p-3">Lifecycle</th>
                </tr>
              </thead>
              <tbody>
                {props.documents.map((document) => (
                  <tr key={document.id} className="border-t border-slate-200">
                    <td className="p-3">
                      <strong>{document.documentType.replaceAll("_", " ")}</strong>
                      <br />
                      <span className="text-xs text-slate-500">
                        {document.originalFileName || "Private file"}
                      </span>
                    </td>
                    <td className="p-3">{document.scanStatus}</td>
                    <td className="p-3">
                      {!document.archivedAt && document.scanStatus === "CLEAN" ? (
                        <a
                          href={`/api/admin/private-documents/${document.id}/download`}
                          className="font-bold underline"
                        >
                          Create temporary link
                        </a>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                    <td className="p-3">
                      {document.archivedAt ? (
                        "Archived"
                      ) : (
                        <SimpleAction
                          action={props.archiveDocumentAction}
                          propertyId={props.propertyId}
                          name="documentId"
                          value={document.id}
                          label="Archive"
                          danger
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {archived.length ? (
        <section>
          <h2 className="font-display text-2xl font-semibold">Archived media</h2>
          <div className="mt-3 space-y-2">
            {archived.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm"
              >
                <span>{asset.mediaSubtype || asset.mediaType} · retained for rollback</span>
                <SimpleAction
                  action={props.restoreMediaAction}
                  propertyId={props.propertyId}
                  name="mediaId"
                  value={asset.id}
                  label="Restore"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
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
      <button
        className={`rounded-lg border px-2 py-1 text-xs font-bold ${danger ? "border-red-300 text-red-800" : "border-slate-300"}`}
      >
        {label}
      </button>
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
      <button className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold">
        {label}
      </button>
    </form>
  );
}
