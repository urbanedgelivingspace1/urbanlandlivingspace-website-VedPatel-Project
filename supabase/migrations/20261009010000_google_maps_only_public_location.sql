-- Google Maps embeds are now the only public map source. A saved embed is an
-- explicit publishing choice and is no longer gated by legacy coordinate visibility.
do $$
declare
  grantor_role text;
begin
  select r.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.member
  where m.roleid = 'urbanedge_public_projection'::regrole
    and m.admin_option = true
    and (r.rolname = current_user or pg_has_role(current_user, r.oid, 'MEMBER'))
  order by (r.rolname = current_user) desc
  limit 1;

  if grantor_role is null then
    grantor_role := current_user;
  end if;

  execute format(
    'grant urbanedge_public_projection to %I with inherit false, set true granted by %I',
    current_user, grantor_role
  );
end;
$$;

grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;

create or replace view public.public_property_google_maps
with (security_invoker = false)
as
select
  property.id as property_id,
  property.google_maps_embed_url
from public.properties property
where property.publication_status = 'PUBLISHED'
  and property.deleted_at is null
  and property.archived_at is null
  and property.google_maps_embed_url is not null;

comment on view public.public_property_google_maps is
  'Detail-only public Google Maps embed sources. Coordinate data is not exposed.';

grant select on public.public_property_google_maps to anon, authenticated, service_role;

set role postgres;
revoke create on schema public from urbanedge_public_projection;
do $$
declare
  grantor_role text;
begin
  select g.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.roleid
  join pg_roles u on u.oid = m.member
  join pg_roles g on g.oid = m.grantor
  where r.rolname = 'urbanedge_public_projection'
    and u.rolname = current_user
    and m.set_option = true
  limit 1;

  if grantor_role is not null then
    execute format(
      'revoke urbanedge_public_projection from %I granted by %I',
      current_user, grantor_role
    );
  end if;
end;
$$;
