// Isolated PostgreSQL workflow check: never connects to Supabase or any application database.
// Install @electric-sql/pglite in a temporary directory and point PROPERTY_VIDEO_DB_RUNTIME there.
import { createRequire } from "node:module";
import { resolve } from "node:path";
const requireRuntime = createRequire(
  resolve(process.env.PROPERTY_VIDEO_DB_RUNTIME ?? ".", "package.json"),
);
const { PGlite } = requireRuntime("@electric-sql/pglite");
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const repo = new URL("..", import.meta.url).pathname;
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls; create role urbanedge_public_projection nologin noinherit nobypassrls;
create schema auth;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
grant usage on schema auth to public; grant usage on schema public to urbanedge_public_projection;
create type public.media_type as enum('IMAGE','VIDEO','BROCHURE','PANORAMA_360','DOCUMENT_PREVIEW','MAP_IMAGE','OTHER');
create type public.record_visibility as enum('ADMIN_ONLY','PUBLIC','PRIVATE');
create type public.media_processing_status as enum('READY','APPROVED','FAILED');
create type public.audit_action as enum('CREATE','UPDATE','ARCHIVE','RESTORE','PUBLISH');
create table public.admin_profiles(user_id uuid primary key,is_active boolean);
create table public.properties(id uuid primary key,publication_status text default 'DRAFT',deleted_at timestamptz,archived_at timestamptz);
create table public.media_assets(
 id uuid primary key,property_id uuid references properties(id),media_type public.media_type,storage_bucket text,object_path text,mime_type text,file_size_bytes bigint,width_px integer,height_px integer,duration_seconds numeric,alt_text text,caption text,visibility public.record_visibility not null default 'ADMIN_ONLY',is_cover boolean default false,sort_order integer default 0,source_type text,checksum_sha256 text,external_url text,external_provider text,external_media_id text,media_subtype text,processing_status public.media_processing_status default 'READY',approved_at timestamptz,created_by uuid,updated_by uuid,created_at timestamptz default now(),updated_at timestamptz default now(),archived_at timestamptz);
create table public.audit_logs(actor_admin_id uuid,action public.audit_action,entity_type text,entity_id uuid,changed_fields text[],after_state jsonb,reason text);
create table public.private_documents(file_size_bytes bigint);
grant select on media_assets,properties to urbanedge_public_projection;
alter table media_assets enable row level security;
create policy projection_public_media on media_assets for select to urbanedge_public_projection using (visibility='PUBLIC' and archived_at is null and exists(select 1 from properties p where p.id=property_id and p.publication_status='PUBLISHED' and p.deleted_at is null and p.archived_at is null));
set role urbanedge_public_projection;
reset role;
grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;
create view public.public_property_media with(security_invoker=false) as select id,property_id,media_type,object_path,mime_type,width_px,height_px,duration_seconds,alt_text,caption,is_cover,sort_order,external_url,external_provider,external_media_id,media_subtype from public.media_assets;
reset role;
grant select on public.public_property_media to anon;
revoke create on schema public from urbanedge_public_projection;
`);
// Reuse actual existing locator/approval constraints rather than relaxing the storage boundary.
const brochureMigration = readFileSync(
  `${repo}/supabase/migrations/20261007020000_google_drive_brochures.sql`,
  "utf8",
);
const locatorStart = brochureMigration.indexOf(
  "alter table public.media_assets add constraint media_assets_locator_check",
);
const locatorEnd = brochureMigration.indexOf(
  "alter table public.media_assets drop constraint media_assets_brochure_scan_check",
);
await db.exec(brochureMigration.slice(locatorStart, locatorEnd));
const mediaMigration = readFileSync(
  `${repo}/supabase/migrations/20260903070000_media_private_storage.sql`,
  "utf8",
);
const approvalStart = mediaMigration.indexOf(
  "alter table public.media_assets add constraint media_assets_public_approval_check",
);
const approvalEnd = mediaMigration.indexOf(
  "alter table public.media_assets add constraint media_assets_brochure_scan_check",
);
await db.exec(mediaMigration.slice(approvalStart, approvalEnd));
try {
  await db.exec(
    readFileSync(`${repo}/supabase/migrations/20261104010000_property_videos.sql`, "utf8"),
  );
  await db.exec(
    readFileSync(`${repo}/supabase/migrations/20261105010000_force_video_poster_rls.sql`, "utf8"),
  );
  console.log("Video migrations applied successfully");
} catch (e) {
  console.error("MIGRATION:", e.message, {
    position: e.position,
    internalPosition: e.internalPosition,
    internalQuery: e.internalQuery,
    where: e.where,
    detail: e.detail,
  });
  process.exit(1);
}
const actor = "70000000-0000-4000-8000-000000000001",
  prop = "20000000-0000-4000-8000-000000000001",
  other = "20000000-0000-4000-8000-000000000002";
await db.query("insert into admin_profiles values($1,true)", [actor]);
await db.query("insert into properties(id) values($1),($2)", [prop, other]);
await db.exec(`set request.jwt.claims='{"role":"service_role"}'`);
const source = (i = 0) => ({
  provider: "YOUTUBE",
  mediaId: `AbCdEf1234${i}`,
  resourceKey: null,
  canonicalUrl: `https://www.youtube.com/watch?v=AbCdEf1234${i}`,
  title: "Aerial view",
  description: "Site video",
  subtype: "STANDARD_VIDEO",
  photoId: null,
});
const call = async (op, payload, property = prop) =>
  (
    await db.query("select public.manage_property_video($1,$2,$3,$4::jsonb) as id", [
      actor,
      property,
      op,
      JSON.stringify(payload),
    ])
  ).rows[0].id;
const row = async (id) => (await db.query("select * from media_assets where id=$1", [id])).rows[0];
const change = async (id, op, extra = {}) =>
  call(op, { id, revision: (await row(id)).video_revision, ...extra });
let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log("PASS", name);
  } catch (e) {
    console.error("FAIL", name, e.message, e.query);
    throw e;
  }
}
let id;
await test("create hidden without video bytes", async () => {
  id = await call("create", source());
  const v = await row(id);
  assert.equal(v.visibility, "ADMIN_ONLY");
  assert.equal(v.storage_bucket, null);
});
await test("draft approval remains excluded publicly", async () => {
  await change(id, "approve");
  assert.equal((await db.query("select * from public_property_media")).rows.length, 0);
});
await test("published approval is public", async () => {
  await db.query("update properties set publication_status='PUBLISHED' where id=$1", [prop]);
  assert.equal((await db.query("select * from public_property_media")).rows.length, 1);
});
await test("cross-property operation rejected", async () => {
  await assert.rejects(
    call("hide", { id, revision: (await row(id)).video_revision }, other),
    /not found on this property/,
  );
});
await test("stale revision rejected", async () => {
  await assert.rejects(call("hide", { id, revision: 0 }), /changed/);
});
await test("duplicate standard/drone rejected", async () => {
  await assert.rejects(call("create", { ...source(), subtype: "DRONE_VIDEO" }), /already attached/);
});
await test("failed replacement leaves original live", async () => {
  await assert.rejects(
    change(id, "replace", { ...source(1), canonicalUrl: "https://evil.test/" }),
    /Invalid YouTube/,
  );
  assert.equal((await row(id)).external_media_id, source().mediaId);
  assert.equal((await row(id)).visibility, "PUBLIC");
});
await test("replacement stages without changing source/order", async () => {
  const before = await row(id);
  await change(id, "replace", source(1));
  const after = await row(id);
  assert.equal(after.external_media_id, before.external_media_id);
  assert.equal(after.sort_order, before.sort_order);
  assert.ok(after.pending_video);
});
await test("approval switches replacement atomically retaining position", async () => {
  const before = await row(id);
  await change(id, "approve");
  const after = await row(id);
  assert.equal(after.external_media_id, source(1).mediaId);
  assert.equal(after.sort_order, before.sort_order);
  assert.equal(after.pending_video, null);
});
await test("hide disappears immediately", async () => {
  await change(id, "hide");
  assert.equal((await db.query("select * from public_property_media")).rows.length, 0);
});
await test("archive then restore returns hidden", async () => {
  await change(id, "approve");
  await change(id, "archive");
  assert.equal((await db.query("select * from public_property_media")).rows.length, 0);
  await change(id, "restore");
  const v = await row(id);
  assert.equal(v.visibility, "ADMIN_ONLY");
  assert.equal(v.processing_status, "READY");
  assert.equal(v.approved_at, null);
});
await test("five-video limit under queued simultaneous calls", async () => {
  await Promise.all([2, 3, 4, 5].map((i) => call("create", source(i))));
  await assert.rejects(call("create", source(6)), /at most five/);
  assert.equal(
    (await db.query("select * from media_assets where media_type='VIDEO' and archived_at is null"))
      .rows.length,
    5,
  );
});
await test("video moves preserve photo position", async () => {
  await db.query(
    "insert into media_assets(id,property_id,media_type,sort_order,storage_bucket,object_path,mime_type,checksum_sha256,alt_text,visibility,processing_status,approved_at) values(gen_random_uuid(),$1,'IMAGE',15,'property-media-public','properties/synthetic.webp','image/webp',repeat('a',64),'Property photo','PUBLIC','APPROVED',now())",
    [prop],
  );
  await change(id, "later");
  assert.equal(
    (await db.query("select sort_order from media_assets where media_type='IMAGE'")).rows[0]
      .sort_order,
    15,
  );
});
await test("stale full-collection ordering cannot reverse videos through the photo workflow", async () => {
  const rows = (
    await db.query(
      "select id,media_type from media_assets where property_id=$1 and archived_at is null order by sort_order,id",
      [prop],
    )
  ).rows;
  const order = rows.map((row) => row.id);
  const positions = rows
    .map((row, index) => (row.media_type === "VIDEO" ? index : -1))
    .filter((index) => index >= 0);
  [order[positions[0]], order[positions[1]]] = [order[positions[1]], order[positions[0]]];
  await assert.rejects(
    db.query("select reorder_property_media($1,$2,$3::uuid[])", [
      actor,
      prop,
      "{" + order.join(",") + "}",
    ]),
    /video order changed/,
  );
});
await test("legacy tied positions normalize without changing photo slots", async () => {
  const targets = (
    await db.query(
      "select id from media_assets where property_id=$1 and media_type='VIDEO' and id<>$2 and archived_at is null limit 2",
      [prop, id],
    )
  ).rows;
  for (const target of targets)
    await db.query("update media_assets set sort_order=100 where id=$1", [target.id]);
  const collection = async () =>
    (
      await db.query(
        "select id,media_type,sort_order from media_assets where property_id=$1 and archived_at is null order by sort_order,id",
        [prop],
      )
    ).rows;
  const before = await collection();
  const photo = before.findIndex((row) => row.media_type === "IMAGE");
  await change(id, "later");
  const after = await collection();
  assert.equal(
    after.findIndex((row) => row.media_type === "IMAGE"),
    photo,
  );
  assert.equal(new Set(after.map((row) => row.sort_order)).size, after.length);
});
await test("unpublishing removes all public videos", async () => {
  await change(id, "approve");
  await db.query("update properties set publication_status='DRAFT' where id=$1", [prop]);
  assert.equal((await db.query("select * from public_property_media")).rows.length, 0);
});
await test("inactive admin rejected", async () => {
  await db.query("update admin_profiles set is_active=false");
  await assert.rejects(change(id, "hide"), /Active admin/);
  await db.query("update admin_profiles set is_active=true");
});
await test("non-service JWT rejected", async () => {
  await db.exec(`set request.jwt.claims='{"role":"authenticated"}'`);
  await assert.rejects(change(id, "hide"), /Service role/);
  await db.exec(`set request.jwt.claims='{"role":"service_role"}'`);
});
await test("poster registration counts retained storage", async () => {
  await change(id, "edit", {
    ...source(1),
    poster: {
      id: "30000000-0000-4000-8000-000000000001",
      path: `properties/${prop}/video-posters/30000000-0000-4000-8000-000000000001.webp`,
      bytes: 4096,
    },
  });
  assert.equal(
    Number((await db.query("select get_storage_usage_bytes() as used")).rows[0].used),
    4096,
  );
});
await test("every successful mutation creates an audit record", async () => {
  assert.ok((await db.query("select * from audit_logs")).rows.length >= 15);
});
await test("Drive resource keys survive storage and public projection", async () => {
  const drive = {
    ...source(),
    provider: "GOOGLE_DRIVE",
    mediaId: "ABCDEFGHIJ_123",
    canonicalUrl: "https://drive.google.com/file/d/ABCDEFGHIJ_123/view?resourcekey=0-key",
    resourceKey: "0-key",
  };
  const driveId = await call("create", drive, other);
  await call("approve", { id: driveId, revision: 0 }, other);
  await db.query("update properties set publication_status='PUBLISHED' where id=$1", [other]);
  const result = (
    await db.query(
      "select drive_resource_key,external_url from public_property_media where id=$1",
      [driveId],
    )
  ).rows[0];
  assert.equal(result.drive_resource_key, "0-key");
  assert.ok(result.external_url.endsWith("?resourcekey=0-key"));
});
await test("poster paths are projected only for approved media", async () => {
  await change(id, "approve");
  await db.query("update properties set publication_status='PUBLISHED' where id=$1", [prop]);
  const visible = (
    await db.query("select video_poster_path from public_property_media where id=$1", [id])
  ).rows[0];
  assert.ok(visible.video_poster_path.endsWith(".webp"));
  await change(id, "hide");
  assert.equal(
    (await db.query("select * from public_property_media where id=$1", [id])).rows.length,
    0,
  );
});
await test("archived photo fallback does not block subsequent video mutations", async () => {
  const photoId = (await db.query("select id from media_assets where media_type='IMAGE'")).rows[0]
    .id;
  await change(id, "edit", { ...source(1), photoId });
  await db.query("update media_assets set archived_at=now() where id=$1", [photoId]);
  await change(id, "approve");
  assert.equal((await row(id)).video_photo_id, null);
});
await test("replacement approval conflict preserves both original and staged data", async () => {
  const live = await row(id);
  await change(id, "replace", source(7));
  await call("create", source(7), other); // reuse across properties is allowed
  await change(id, "archive"); // free one slot; another record takes the staged identity
  const conflicting = await call("create", source(7));
  // A restored record must not exceed capacity; release a different slot before restoring.
  await change(conflicting, "archive");
  await change(id, "restore");
  await change(id, "replace", source(7));
  // Change an existing active record through a separate approved replacement to take the same identity.
  const neighbor = (
    await db.query(
      "select id from media_assets where property_id=$1 and media_type='VIDEO' and archived_at is null and id<>$2 limit 1",
      [prop, id],
    )
  ).rows[0].id;
  await change(neighbor, "replace", source(7));
  await change(neighbor, "approve");
  await assert.rejects(change(id, "approve"), /already attached/);
  assert.equal((await row(id)).external_media_id, live.external_media_id);
  assert.ok((await row(id)).pending_video);
});
await test("anonymous role cannot execute video mutations or read poster registry", async () => {
  await db.exec("set role anon");
  await assert.rejects(
    db.query("select public.manage_property_video($1,$2,$3,$4::jsonb)", [
      actor,
      prop,
      "create",
      JSON.stringify(source(8)),
    ]),
    /permission denied/,
  );
  await assert.rejects(
    db.query("select * from public.property_video_posters"),
    /permission denied/,
  );
  await db.exec("reset role");
});
await test("a new screenshot takes priority over a stale clear-poster checkbox", async () => {
  const video = (
    await db.query(
      "select id from media_assets where property_id=$1 and media_type='VIDEO' and archived_at is null limit 1",
      [prop],
    )
  ).rows[0].id;
  const posterId = "30000000-0000-4000-8000-000000000002";
  const current = await row(video);
  await change(video, "edit", {
    provider: current.external_provider,
    mediaId: current.external_media_id,
    canonicalUrl: current.external_url,
    resourceKey: current.drive_resource_key,
    title: "Updated poster",
    description: "",
    subtype: "STANDARD_VIDEO",
    photoId: null,
    clearPoster: true,
    poster: {
      id: posterId,
      path: `properties/${prop}/video-posters/${posterId}.webp`,
      bytes: 2048,
    },
  });
  assert.equal((await row(video)).video_poster_id, posterId);
});
console.log(`${passed} database workflow assertions passed`);
await db.close();
