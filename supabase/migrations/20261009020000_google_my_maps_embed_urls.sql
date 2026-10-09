alter table public.properties
  drop constraint if exists properties_google_maps_embed_url_check;

alter table public.properties
  add constraint properties_google_maps_embed_url_check
  check (
    google_maps_embed_url is null
    or (
      length(google_maps_embed_url) <= 12000
      and google_maps_embed_url ~ '^https://(www|maps)[.]google[.]com/maps/(d/)?embed([/?].*)?$'
    )
  );

comment on column public.properties.google_maps_embed_url is
  'Validated Google Maps or Google My Maps embed URL. Raw iframe markup is never stored.';
