-- Match the application-wide RLS requirement without granting browser access.
alter table public.property_video_posters force row level security;
