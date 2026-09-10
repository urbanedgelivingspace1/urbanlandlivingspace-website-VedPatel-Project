import { notFound } from "next/navigation";

import { PropertyWorkspace } from "@/components/admin/property-workspace";
import { requireActiveAdminPage } from "@/server/auth/require-admin-page";
import { getPropertyInterestedBuyers } from "@/server/services/crm";
import { getAdminProperty } from "@/server/services/property-drafts";
import { getPropertyActivity } from "@/server/services/property-drafts";
import {
  getAdminPropertyDocuments,
  getAdminPropertyVisualMedia,
} from "@/server/services/property-media";
import { getPublicationReadiness } from "@/server/services/property-publication";

import {
  archivePropertyAction,
  changeAvailabilityAction,
  createDocumentSignedUrlAction,
  markPropertySoldAction,
  publishPropertyAction,
  restorePropertyAction,
  unpublishPropertyAction,
  uploadBatchPropertyDocumentsAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPropertyDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tab?: string }>;
}>) {
  const { id } = await params;
  await requireActiveAdminPage();
  const query = await searchParams;
  const allowedTabs = ["overview", "media", "documents", "review", "buyers", "activity"] as const;
  const activeTab = allowedTabs.find((tab) => tab === query.tab) ?? "overview";
  const [property, readiness, mediaList, documentList, interestedBuyers, activity] =
    await Promise.all([
      getAdminProperty(id),
      activeTab === "review" ? getPublicationReadiness(id) : Promise.resolve(undefined),
      activeTab === "media" || activeTab === "review"
        ? getAdminPropertyVisualMedia(id).catch(() => [])
        : Promise.resolve([]),
      activeTab === "documents"
        ? getAdminPropertyDocuments(id).catch(() => [])
        : Promise.resolve([]),
      activeTab === "buyers"
        ? getPropertyInterestedBuyers(id).catch(() => ({ matches: [], siteVisits: [] }))
        : Promise.resolve({ matches: [], siteVisits: [] }),
      activeTab === "activity" ? getPropertyActivity(id).catch(() => []) : Promise.resolve([]),
    ]);
  if (!property) notFound();

  return (
    <PropertyWorkspace
      property={property}
      readiness={readiness}
      initialTab={activeTab}
      mediaList={mediaList}
      documentList={documentList}
      interestedBuyers={interestedBuyers}
      activity={activity}
      savedNotice={Boolean(query.saved)}
      publishAction={publishPropertyAction}
      unpublishAction={unpublishPropertyAction}
      changeAvailabilityAction={changeAvailabilityAction}
      markPropertySoldAction={markPropertySoldAction}
      archivePropertyAction={archivePropertyAction}
      restorePropertyAction={restorePropertyAction}
      uploadBatchPropertyDocumentsAction={uploadBatchPropertyDocumentsAction}
      createDocumentSignedUrlAction={createDocumentSignedUrlAction}
    />
  );
}
