-- Read-only preflight. Run on the intended database BEFORE enabling property videos.
-- Does not require the new migration and does not modify existing media.

-- Inventory existing video providers and publication states (including legacy Vimeo).
select external_provider, media_subtype, visibility, processing_status,
       count(*) as records, count(*) filter (where archived_at is null) as active_records
from public.media_assets
where media_type = 'VIDEO'
group by external_provider, media_subtype, visibility, processing_status
order by external_provider, media_subtype, visibility;

-- Resolve duplicates manually: the new boundary rejects duplicate identities across subtypes.
select property_id, external_provider, external_media_id, count(*) as active_duplicates,
       array_agg(id order by created_at, id) as media_ids
from public.media_assets
where media_type = 'VIDEO' and archived_at is null
group by property_id, external_provider, external_media_id
having count(*) > 1;

-- Existing over-limit properties are retained; archive unnecessary associations before additions.
select property_id, count(*) as active_videos
from public.media_assets
where media_type = 'VIDEO' and archived_at is null
group by property_id having count(*) > 5;

-- Legacy tied positions require review before pilot ordering checks.
select property_id, sort_order, count(*) as tied_positions
from public.media_assets where archived_at is null
group by property_id, sort_order having count(*) > 1;
