import "server-only";

import {
  buildSecurityHealthSnapshot,
  type SecurityHealthSnapshot,
} from "@/features/admin/domain/security-health";
import { requireActiveAdmin } from "@/server/auth/authorization";
import { getServerEnvironment } from "@/server/env";
import { getStorageConfig } from "@/server/storage/config";
import { createPrivilegedServerClient } from "@/server/supabase/privileged";

const LATEST_AUDITED_MIGRATION = "20260906030000_m17_security_hardening";

export async function getSecurityHealth(): Promise<SecurityHealthSnapshot> {
  await requireActiveAdmin();
  const environment = getServerEnvironment();
  const storage = getStorageConfig();
  const client = createPrivilegedServerClient();

  const [databaseProbe, bucketProbe] = await Promise.all([
    client.from("admin_profiles").select("user_id", { count: "exact", head: true }).limit(1),
    client.storage.listBuckets(),
  ]);

  const expectedBuckets = new Map([
    [storage.buckets.propertyMediaPublic, true],
    [storage.buckets.guideMediaPublic, true],
    [storage.buckets.propertyMediaPrivate, false],
    [storage.buckets.verificationDocumentsPrivate, false],
    [storage.buckets.ownerSubmissionsPrivate, false],
  ]);
  const actualBuckets = new Map(
    (bucketProbe.data ?? []).map((bucket) => [bucket.name, bucket.public]),
  );
  const bucketConfigurationMatches = [...expectedBuckets].every(
    ([name, isPublic]) => actualBuckets.get(name) === isPublic,
  );

  return buildSecurityHealthSnapshot({
    checkedAt: new Date().toISOString(),
    environment: environment.APP_ENV,
    migration: LATEST_AUDITED_MIGRATION,
    databaseReachable: !databaseProbe.error,
    storageReachable: !bucketProbe.error,
    bucketConfigurationMatches,
    emailConfigured: Boolean(
      environment.RESEND_API_KEY && environment.EMAIL_FROM && environment.ADMIN_NOTIFICATION_EMAIL,
    ),
    turnstileConfigured: Boolean(
      environment.NEXT_PUBLIC_TURNSTILE_SITE_KEY && environment.TURNSTILE_SECRET_KEY,
    ),
    hmacConfigured: Boolean(environment.HMAC_SECRET),
    malwareScannerConfigured: Boolean(
      environment.MALWARE_SCAN_ENDPOINT && environment.MALWARE_SCAN_TOKEN,
    ),
    analyticsEnabled: environment.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    mapConfigured: Boolean(
      environment.NEXT_PUBLIC_MAP_PROVIDER && environment.NEXT_PUBLIC_MAP_STYLE_URL,
    ),
  });
}
