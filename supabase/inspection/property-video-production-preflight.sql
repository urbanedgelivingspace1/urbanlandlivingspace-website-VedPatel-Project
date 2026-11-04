-- Read-only production check. No migration or data changes are performed by this query.
select current_database() as database_name, current_user as database_role, version() as postgres_version;

select version, name from supabase_migrations.schema_migrations order by version;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and (
  (table_name='media_assets' and column_name in ('external_provider','external_media_id','media_subtype','processing_status','video_title','drive_resource_key','video_photo_id','video_poster_id','pending_video','video_revision'))
  or table_name='property_video_posters'
) order by table_name,ordinal_position;

select tablename, policyname, roles, cmd from pg_policies
where schemaname='public' and tablename in ('media_assets','property_video_posters');

select 'properties' as relation,count(*) as row_count from public.properties
union all select 'media_assets',count(*) from public.media_assets
union all select 'private_documents',count(*) from public.private_documents
union all select 'leads',count(*) from public.leads;

select external_provider, count(*) as active_videos from public.media_assets
where media_type='VIDEO' and archived_at is null group by external_provider;
