# Migrations

Seventeen ordered, forward-oriented migrations cover M2–M17: authoritative schema, integrity and
indexes, public projections, RLS/grants/authorization, property/media/verification/publication,
public experience/search, CRM and public intake, site visits, owner submissions, content/SEO and the
final security-hardening boundary. The filename order and SHA-256 manifest are recorded in
`docs/runbooks/m19-deployment-preparation.md`.

The complete sequence has been rebuilt from zero against the isolated local Supabase project. Apply
it to staging only through `supabase db push` after inspecting `supabase migration list` and a
`--dry-run`. Do not use the synthetic local seed for cloud/production. No production migration is
authorized or recorded.
