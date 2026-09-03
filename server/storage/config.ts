import "server-only";

import { getServerEnvironment } from "@/server/env";

export type StorageBucketKey =
  | "propertyMediaPublic"
  | "propertyMediaPrivate"
  | "verificationDocumentsPrivate"
  | "ownerSubmissionsPrivate"
  | "guideMediaPublic";

export function getStorageConfig() {
  const environment = getServerEnvironment();
  if (environment.MEDIA_STORAGE_WARNING_PERCENT >= environment.MEDIA_STORAGE_HARD_STOP_PERCENT) {
    throw new Error("Media storage warning threshold must be below the hard-stop threshold.");
  }
  return {
    buckets: {
      propertyMediaPublic: environment.STORAGE_PROPERTY_MEDIA_PUBLIC_BUCKET,
      propertyMediaPrivate: environment.STORAGE_PROPERTY_MEDIA_PRIVATE_BUCKET,
      verificationDocumentsPrivate: environment.STORAGE_VERIFICATION_DOCUMENTS_PRIVATE_BUCKET,
      ownerSubmissionsPrivate: environment.STORAGE_OWNER_SUBMISSIONS_PRIVATE_BUCKET,
      guideMediaPublic: environment.STORAGE_GUIDE_MEDIA_PUBLIC_BUCKET,
    },
    signedUrlTtlSeconds: environment.STORAGE_SIGNED_URL_TTL_SECONDS,
    budgetBytes: environment.MEDIA_STORAGE_BUDGET_BYTES,
    warningPercent: environment.MEDIA_STORAGE_WARNING_PERCENT,
    hardStopPercent: environment.MEDIA_STORAGE_HARD_STOP_PERCENT,
  } as const;
}
