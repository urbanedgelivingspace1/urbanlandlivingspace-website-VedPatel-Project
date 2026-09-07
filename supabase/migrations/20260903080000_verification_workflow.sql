create type public.verification_source_class as enum (
  'LEGAL_OFFICIAL_REQUIREMENT',
  'OFFICIAL_ADMINISTRATIVE_PRACTICE',
  'PROFESSIONAL_DUE_DILIGENCE',
  'URBANEDGE_OPERATIONAL_POLICY'
);
create type public.evidence_provenance_state as enum (
  'RECEIVED', 'REVIEWED', 'SOURCE_VERIFIED', 'PROFESSIONALLY_REVIEWED', 'SUPERSEDED', 'REVOKED'
);
create type public.verification_applicability as enum ('UNDETERMINED', 'APPLICABLE', 'NOT_APPLICABLE');
create type public.professional_review_status as enum (
  'NOT_REQUIRED', 'REQUESTED', 'MATERIALS_PENDING', 'IN_REVIEW', 'COMPLETED',
  'PARTIALLY_COMPLETED', 'REQUIRES_MORE_INFORMATION', 'SUPERSEDED', 'REQUIRES_REVIEW'
);
create type public.verification_exception_status as enum ('OPEN', 'RESOLVED', 'ACCEPTED_LIMITATION');
create type public.public_copy_approval_status as enum ('DRAFT', 'APPROVED', 'RETIRED');

alter table public.source_references
  add column source_class public.verification_source_class,
  add column record_identifier varchar(180),
  add column certification_type varchar(100),
  add column retrieval_method varchar(100),
  add column snapshot_reference varchar(240),
  add column source_version varchar(120);

update public.source_references set source_class = case source_classification
  when 'LEGAL_OFFICIAL' then 'LEGAL_OFFICIAL_REQUIREMENT'::public.verification_source_class
  when 'ADMINISTRATIVE_PRACTICE' then 'OFFICIAL_ADMINISTRATIVE_PRACTICE'::public.verification_source_class
  else 'URBANEDGE_OPERATIONAL_POLICY'::public.verification_source_class
end where source_class is null;

alter table public.verification_check_definitions
  add column source_class public.verification_source_class not null default 'URBANEDGE_OPERATIONAL_POLICY',
  add column required_evidence boolean not null default true,
  add column minimum_provenance public.evidence_provenance_state not null default 'REVIEWED',
  add column evidence_types text[] not null default '{}',
  add column policy_version integer not null default 1,
  add column blocked_if_stale boolean not null default true,
  add column requires_exception_resolution boolean not null default true,
  add constraint verification_definition_policy_version_check check (policy_version > 0),
  add constraint verification_definition_minimum_provenance_check check (
    minimum_provenance not in ('SUPERSEDED', 'REVOKED')
  );

alter table public.property_verifications
  add column applicability public.verification_applicability not null default 'UNDETERMINED',
  add column applicability_reason text,
  add column limitations text,
  add column unresolved_exceptions_summary text,
  add column public_limitation text,
  add column public_disclosure_eligible boolean not null default false,
  add column check_date date,
  add column review_iteration integer not null default 0,
  add constraint property_verification_iteration_check check (review_iteration >= 0),
  add constraint property_verification_not_applicable_state_check check (
    applicability <> 'NOT_APPLICABLE' or status = 'NOT_STARTED'
  ),
  add constraint property_verification_public_eligibility_check check (
    not public_disclosure_eligible or (
      applicability = 'APPLICABLE'
      and status in ('PASSED', 'PASSED_WITH_NOTE')
      and scope_statement is not null
      and reviewed_by is not null
      and reviewed_at is not null
    )
  );

create table public.verification_public_copy_policies (
  id uuid primary key default gen_random_uuid(),
  check_definition_id uuid not null references public.verification_check_definitions(id) on delete restrict,
  version integer not null,
  label varchar(180) not null,
  explanation_template text not null,
  limitation_template text not null,
  approval_status public.public_copy_approval_status not null default 'DRAFT',
  approved_by uuid references public.admin_profiles(user_id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict,
  retired_at timestamptz,
  unique (check_definition_id, version),
  check (version > 0),
  check (
    lower(label || ' ' || explanation_template) !~
    '(100% clear title|clear title|legally verified|government approved|fully verified|dispute[ -]free|guaranteed na|guaranteed construction|risk[ -]free|no legal issues)'
  ),
  check (
    (approval_status = 'APPROVED' and approved_by is not null and approved_at is not null and retired_at is null)
    or approval_status <> 'APPROVED'
  )
);

alter table public.property_verifications
  add column public_copy_policy_id uuid references public.verification_public_copy_policies(id) on delete restrict;

create table public.professional_reviews (
  id uuid primary key default gen_random_uuid(),
  property_verification_id uuid not null references public.property_verifications(id) on delete restrict,
  professional_type varchar(40) not null check (professional_type in ('LAWYER','SURVEYOR','PLANNER','ENGINEER','OTHER')),
  status public.professional_review_status not null default 'REQUESTED',
  professional_name varchar(180),
  professional_reference varchar(180),
  scope_statement text not null,
  outcome_summary text,
  limitations text,
  review_date date,
  evidence_reference varchar(180),
  requested_by uuid not null references public.admin_profiles(user_id) on delete restrict,
  completed_by uuid references public.admin_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  superseded_at timestamptz,
  check (length(btrim(scope_statement)) >= 20),
  check (
    status <> 'COMPLETED' or (
      professional_name is not null and outcome_summary is not null and review_date is not null
      and completed_by is not null
    )
  )
);

create table public.verification_exceptions (
  id uuid primary key default gen_random_uuid(),
  property_verification_id uuid not null references public.property_verifications(id) on delete restrict,
  severity public.risk_level not null,
  summary text not null,
  limitation text,
  blocks_public_disclosure boolean not null default true,
  professional_referral_required boolean not null default false,
  status public.verification_exception_status not null default 'OPEN',
  resolved_at timestamptz,
  resolved_by uuid references public.admin_profiles(user_id) on delete restrict,
  resolution_summary text,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.admin_profiles(user_id) on delete restrict,
  check (length(btrim(summary)) >= 10),
  check (
    (status = 'OPEN' and resolved_at is null and resolved_by is null)
    or (status <> 'OPEN' and resolved_at is not null and resolved_by is not null and resolution_summary is not null)
  )
);

create table public.verification_history (
  id bigint generated always as identity primary key,
  property_verification_id uuid not null references public.property_verifications(id) on delete restrict,
  event_type varchar(80) not null,
  from_status public.verification_status,
  to_status public.verification_status,
  actor_admin_id uuid not null references public.admin_profiles(user_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  review_iteration integer not null,
  reason text,
  check (review_iteration >= 0)
);

alter table public.verification_evidence
  add column provenance_state public.evidence_provenance_state not null default 'RECEIVED',
  add column source_class public.verification_source_class not null default 'URBANEDGE_OPERATIONAL_POLICY',
  add column reviewed_by uuid references public.admin_profiles(user_id) on delete restrict,
  add column reviewed_at timestamptz,
  add column source_verified_by uuid references public.admin_profiles(user_id) on delete restrict,
  add column source_verified_at timestamptz,
  add column professional_review_id uuid references public.professional_reviews(id) on delete restrict,
  add column superseded_by_id uuid references public.verification_evidence(id) on delete restrict,
  add column superseded_at timestamptz,
  add column revoked_at timestamptz,
  add column revoked_by uuid references public.admin_profiles(user_id) on delete restrict,
  add column updated_at timestamptz not null default now(),
  add constraint verification_evidence_lifecycle_check check (
    (provenance_state = 'SUPERSEDED' and superseded_by_id is not null and superseded_at is not null and revoked_at is null)
    or (provenance_state = 'REVOKED' and revoked_at is not null and revoked_by is not null and superseded_at is null)
    or (provenance_state not in ('SUPERSEDED','REVOKED') and superseded_by_id is null and superseded_at is null and revoked_at is null)
  ),
  add constraint verification_evidence_review_check check (
    provenance_state = 'RECEIVED' or reviewed_by is not null and reviewed_at is not null
  ),
  add constraint verification_evidence_source_review_check check (
    provenance_state not in ('SOURCE_VERIFIED','PROFESSIONALLY_REVIEWED')
    or source_verified_by is not null and source_verified_at is not null
  ),
  add constraint verification_evidence_professional_check check (
    provenance_state <> 'PROFESSIONALLY_REVIEWED' or professional_review_id is not null
  ),
  add constraint verification_evidence_not_self_superseded_check check (superseded_by_id is null or superseded_by_id <> id),
  add constraint verification_evidence_type_check check (evidence_type in (
    'OWNER_DOCUMENT','BROKER_DOCUMENT','OFFICIAL_RECORD','CERTIFIED_OFFICIAL_RECORD',
    'OFFICIAL_PORTAL_RESULT','OFFICIAL_SEARCH_RESULT','REGISTERED_INSTRUMENT','AUTHORITY_ORDER',
    'AUTHORITY_LETTER','COURT_OR_REVENUE_SEARCH','SITE_OBSERVATION','SURVEY_MAP','MAPNI_RECORD',
    'PROFESSIONAL_REPORT','PROFESSIONAL_OPINION','PHOTOGRAPHIC_OBSERVATION','OTHER_RECORDED_OBSERVATION'
  ));

create index verification_history_check_idx on public.verification_history(property_verification_id, occurred_at desc);
create index verification_exceptions_open_idx on public.verification_exceptions(property_verification_id) where status = 'OPEN';
create index professional_reviews_check_idx on public.professional_reviews(property_verification_id, created_at desc);
create index verification_evidence_current_idx on public.verification_evidence(property_verification_id, provenance_state)
  where provenance_state not in ('SUPERSEDED','REVOKED');
create unique index verification_public_copy_approved_uidx
  on public.verification_public_copy_policies(check_definition_id) where approval_status = 'APPROVED';

create trigger professional_reviews_set_updated_at before update on public.professional_reviews
for each row execute function public.set_updated_at();
create trigger verification_evidence_set_updated_at before update on public.verification_evidence
for each row execute function public.set_updated_at();

alter table public.verification_public_copy_policies enable row level security;
alter table public.professional_reviews enable row level security;
alter table public.verification_exceptions enable row level security;
alter table public.verification_history enable row level security;
create policy active_admin_select on public.verification_public_copy_policies for select to authenticated using ((select public.is_active_admin()));
create policy active_admin_select on public.professional_reviews for select to authenticated using ((select public.is_active_admin()));
create policy active_admin_select on public.verification_exceptions for select to authenticated using ((select public.is_active_admin()));
create policy active_admin_select on public.verification_history for select to authenticated using ((select public.is_active_admin()));
revoke all on public.verification_public_copy_policies, public.professional_reviews, public.verification_exceptions, public.verification_history from anon, authenticated;
grant select on public.verification_public_copy_policies, public.professional_reviews, public.verification_exceptions, public.verification_history to authenticated;
grant all on public.verification_public_copy_policies, public.professional_reviews, public.verification_exceptions, public.verification_history to service_role;
grant usage, select on sequence public.verification_history_id_seq to service_role;

create or replace function public.verification_provenance_rank(value public.evidence_provenance_state)
returns integer language sql immutable set search_path = '' as $$
  select case value
    when 'RECEIVED' then 1 when 'REVIEWED' then 2 when 'SOURCE_VERIFIED' then 3
    when 'PROFESSIONALLY_REVIEWED' then 4 else 0 end;
$$;

create or replace function public.initialize_property_verifications(requested_actor_id uuid, requested_property_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare property_row public.properties%rowtype; inserted_count integer;
begin
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  select * into property_row from public.properties where id = requested_property_id and deleted_at is null;
  if not found then raise exception 'Property not found'; end if;
  insert into public.property_verifications (
    property_id, check_definition_id, applicability, applicability_reason, risk_level
  )
  select property_row.id, definition.id,
    case when (definition.category_scope is null or definition.category_scope = property_row.land_category)
      and (definition.applies_to_transaction is null or definition.applies_to_transaction = property_row.primary_transaction_type)
      then 'APPLICABLE'::public.verification_applicability else 'NOT_APPLICABLE'::public.verification_applicability end,
    case when definition.category_scope is not null and definition.category_scope <> property_row.land_category
      then 'Different land category'
      when definition.applies_to_transaction is not null and definition.applies_to_transaction <> property_row.primary_transaction_type
      then 'Different transaction context' else 'Category and transaction candidate; confirm evidence and property facts' end,
    definition.risk_if_failed
  from public.verification_check_definitions definition where definition.is_active
  on conflict (property_id, check_definition_id) do nothing;
  get diagnostics inserted_count = row_count;
  insert into public.audit_logs(actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'VERIFICATION_CHANGE', 'property_verification_plan', requested_property_id,
    array['check_definitions','applicability'], jsonb_build_object('createdCount', inserted_count), 'Initialized scoped verification plan');
  return inserted_count;
end;
$$;

create or replace function public.set_verification_applicability(
  requested_actor_id uuid, requested_verification_id uuid,
  requested_applicability public.verification_applicability, requested_reason text
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.property_verifications%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  select * into current_row from public.property_verifications where id = requested_verification_id for update;
  if not found then raise exception 'Verification check not found'; end if;
  if requested_applicability <> 'APPLICABLE' and current_row.status <> 'NOT_STARTED' then raise exception 'Only not-started checks can become non-applicable'; end if;
  if length(btrim(coalesce(requested_reason,''))) < 10 then raise exception 'Applicability requires a specific reason'; end if;
  update public.property_verifications set applicability=requested_applicability, applicability_reason=btrim(requested_reason),
    public_visible=false, public_disclosure_eligible=false where id=requested_verification_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(requested_verification_id,'APPLICABILITY_CHANGED',current_row.status,current_row.status,requested_actor_id,current_row.review_iteration,btrim(requested_reason));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'VERIFICATION_CHANGE','property_verification',requested_verification_id,array['applicability'],
    jsonb_build_object('applicability',current_row.applicability),jsonb_build_object('applicability',requested_applicability),'Applicability changed');
end;
$$;

create or replace function public.link_verification_evidence(
  requested_actor_id uuid, requested_verification_id uuid, requested_payload jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.property_verifications%rowtype; target_id uuid := coalesce(nullif(requested_payload->>'id','')::uuid, gen_random_uuid());
declare document_id uuid := nullif(requested_payload->>'privateDocumentId','')::uuid; source_id uuid := nullif(requested_payload->>'sourceReferenceId','')::uuid;
declare evidence_kind text := requested_payload->>'evidenceType'; source_kind public.verification_source_class := (requested_payload->>'sourceClass')::public.verification_source_class;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if exists (select 1 from jsonb_object_keys(requested_payload) key where key not in ('id','privateDocumentId','sourceReferenceId','evidenceType','sourceClass','evidenceReference','observedDate','supportsCheck','notes')) then raise exception 'Unsupported evidence field'; end if;
  select * into current_row from public.property_verifications where id=requested_verification_id;
  if not found or current_row.applicability <> 'APPLICABLE' then raise exception 'Applicable verification check not found'; end if;
  if document_id is null and source_id is null and length(btrim(coalesce(requested_payload->>'notes',''))) < 10 then raise exception 'Evidence requires a document, source, or specific observation'; end if;
  if document_id is not null and not exists (select 1 from public.private_documents where id=document_id and property_id=current_row.property_id and archived_at is null and scan_status='CLEAN') then raise exception 'Private document must belong to the property and have a clean trusted scan'; end if;
  if source_id is not null and not exists (select 1 from public.source_references where id=source_id) then raise exception 'Source reference not found'; end if;
  insert into public.verification_evidence(id,property_verification_id,private_document_id,source_reference_id,evidence_type,evidence_reference,observed_date,supports_check,evidence_notes_internal,created_by,source_class)
  values(target_id,requested_verification_id,document_id,source_id,evidence_kind,nullif(btrim(requested_payload->>'evidenceReference'),''),nullif(requested_payload->>'observedDate','')::date,coalesce((requested_payload->>'supportsCheck')::boolean,true),nullif(btrim(requested_payload->>'notes'),''),requested_actor_id,source_kind);
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(requested_verification_id,'EVIDENCE_LINKED',current_row.status,current_row.status,requested_actor_id,current_row.review_iteration,'Evidence linked in RECEIVED state');
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state,reason)
  values(requested_actor_id,'VERIFICATION_CHANGE','verification_evidence',target_id,array['property_verification_id','evidence_type','provenance_state'],jsonb_build_object('verificationId',requested_verification_id,'evidenceType',evidence_kind,'provenance','RECEIVED'),'Evidence linked; private contents omitted');
  return target_id;
end;
$$;

create or replace function public.advance_verification_evidence(
  requested_actor_id uuid, requested_evidence_id uuid, requested_state public.evidence_provenance_state,
  requested_professional_review_id uuid default null
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.verification_evidence%rowtype; verification_row public.property_verifications%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.verification_evidence where id=requested_evidence_id for update;
  if not found then raise exception 'Evidence not found'; end if;
  select * into verification_row from public.property_verifications where id=current_row.property_verification_id;
  if not ((current_row.provenance_state='RECEIVED' and requested_state='REVIEWED') or (current_row.provenance_state='REVIEWED' and requested_state='SOURCE_VERIFIED') or (current_row.provenance_state='SOURCE_VERIFIED' and requested_state='PROFESSIONALLY_REVIEWED')) then raise exception 'Invalid evidence provenance transition'; end if;
  if requested_state='PROFESSIONALLY_REVIEWED' and not exists (select 1 from public.professional_reviews where id=requested_professional_review_id and property_verification_id=current_row.property_verification_id and status='COMPLETED') then raise exception 'A completed scoped professional review is required'; end if;
  update public.verification_evidence set provenance_state=requested_state,
    reviewed_by=coalesce(reviewed_by,requested_actor_id), reviewed_at=coalesce(reviewed_at,now()),
    source_verified_by=case when requested_state in ('SOURCE_VERIFIED','PROFESSIONALLY_REVIEWED') then coalesce(source_verified_by,requested_actor_id) else source_verified_by end,
    source_verified_at=case when requested_state in ('SOURCE_VERIFIED','PROFESSIONALLY_REVIEWED') then coalesce(source_verified_at,now()) else source_verified_at end,
    professional_review_id=case when requested_state='PROFESSIONALLY_REVIEWED' then requested_professional_review_id else professional_review_id end
    where id=requested_evidence_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(current_row.property_verification_id,'EVIDENCE_'||requested_state,verification_row.status,verification_row.status,requested_actor_id,verification_row.review_iteration,'Evidence provenance advanced');
end;
$$;

create or replace function public.retire_verification_evidence(
  requested_actor_id uuid, requested_evidence_id uuid, requested_state public.evidence_provenance_state,
  requested_replacement_id uuid default null, requested_reason text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.verification_evidence%rowtype; verification_row public.property_verifications%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if requested_state not in ('SUPERSEDED','REVOKED') then raise exception 'Evidence can only be superseded or revoked'; end if;
  if length(btrim(coalesce(requested_reason,''))) < 10 then raise exception 'Retiring evidence requires a specific reason'; end if;
  select * into current_row from public.verification_evidence where id=requested_evidence_id for update;
  if not found or current_row.provenance_state in ('SUPERSEDED','REVOKED') then raise exception 'Current evidence not found'; end if;
  if requested_state='SUPERSEDED' and not exists (select 1 from public.verification_evidence where id=requested_replacement_id and property_verification_id=current_row.property_verification_id and provenance_state not in ('SUPERSEDED','REVOKED')) then raise exception 'Current replacement evidence is required'; end if;
  update public.verification_evidence set provenance_state=requested_state,
    superseded_by_id=case when requested_state='SUPERSEDED' then requested_replacement_id end,
    superseded_at=case when requested_state='SUPERSEDED' then now() end,
    revoked_at=case when requested_state='REVOKED' then now() end,
    revoked_by=case when requested_state='REVOKED' then requested_actor_id end where id=requested_evidence_id;
  select * into verification_row from public.property_verifications where id=current_row.property_verification_id for update;
  if verification_row.status in ('PASSED','PASSED_WITH_NOTE') then
    update public.property_verifications set status='REQUIRES_REVIEW',public_visible=false,public_disclosure_eligible=false where id=verification_row.id;
  end if;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(current_row.property_verification_id,'EVIDENCE_'||requested_state,verification_row.status,
    case when verification_row.status in ('PASSED','PASSED_WITH_NOTE') then 'REQUIRES_REVIEW'::public.verification_status else verification_row.status end,
    requested_actor_id,verification_row.review_iteration,btrim(requested_reason));
end;
$$;

create or replace function public.transition_property_verification(
  requested_actor_id uuid, requested_verification_id uuid, requested_target public.verification_status,
  requested_payload jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.property_verifications%rowtype; definition_row public.verification_check_definitions%rowtype;
declare scope_value text := nullif(btrim(requested_payload->>'scopeStatement'),''); notes_value text := nullif(btrim(requested_payload->>'notes'),'');
declare limitation_value text := nullif(btrim(requested_payload->>'limitations'),''); recheck_value timestamptz := nullif(requested_payload->>'recheckAt','')::timestamptz;
declare referral_value boolean := coalesce((requested_payload->>'referralRequired')::boolean,false); referral_kind text := nullif(requested_payload->>'referralType','');
declare evidence_ok boolean; blocking_exception boolean; completed_professional boolean;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if exists (select 1 from jsonb_object_keys(requested_payload) key where key not in ('scopeStatement','notes','limitations','recheckAt','riskLevel','referralRequired','referralType','reason')) then raise exception 'Unsupported verification field'; end if;
  select * into current_row from public.property_verifications where id=requested_verification_id for update;
  if not found then raise exception 'Verification check not found'; end if;
  select * into definition_row from public.verification_check_definitions where id=current_row.check_definition_id;
  if current_row.applicability <> 'APPLICABLE' then raise exception 'Only applicable checks can transition'; end if;
  if not ((current_row.status='NOT_STARTED' and requested_target='IN_REVIEW')
    or (current_row.status='IN_REVIEW' and requested_target in ('PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW'))
    or (current_row.status in ('FAILED','REQUIRES_REVIEW','EXPIRED') and requested_target='IN_REVIEW')
    or (current_row.status in ('PASSED','PASSED_WITH_NOTE') and requested_target in ('EXPIRED','REQUIRES_REVIEW'))) then raise exception 'Invalid verification status transition'; end if;
  if requested_target in ('PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW') and length(coalesce(scope_value,current_row.scope_statement,'')) < 20 then raise exception 'A specific verification scope of at least 20 characters is required'; end if;
  select exists(select 1 from public.verification_evidence evidence
    left join public.private_documents document on document.id=evidence.private_document_id
    where evidence.property_verification_id=current_row.id and evidence.supports_check
      and evidence.provenance_state not in ('SUPERSEDED','REVOKED')
      and public.verification_provenance_rank(evidence.provenance_state) >= public.verification_provenance_rank(definition_row.minimum_provenance)
      and (evidence.private_document_id is null or (document.archived_at is null and document.scan_status='CLEAN'))) into evidence_ok;
  select exists(select 1 from public.verification_exceptions exception where exception.property_verification_id=current_row.id and exception.status='OPEN' and exception.blocks_public_disclosure) into blocking_exception;
  select exists(select 1 from public.professional_reviews review where review.property_verification_id=current_row.id and review.status='COMPLETED'
    and ((definition_row.lawyer_review_required_by_default and review.professional_type='LAWYER') or (definition_row.surveyor_review_required_by_default and review.professional_type='SURVEYOR'))) into completed_professional;
  if requested_target in ('PASSED','PASSED_WITH_NOTE') and definition_row.required_evidence and not evidence_ok then raise exception 'Current eligible evidence at the required provenance is required'; end if;
  if requested_target in ('PASSED','PASSED_WITH_NOTE') and blocking_exception and definition_row.requires_exception_resolution then raise exception 'Resolve disclosure-blocking exceptions before passing this check'; end if;
  if requested_target in ('PASSED','PASSED_WITH_NOTE') and (definition_row.lawyer_review_required_by_default or definition_row.surveyor_review_required_by_default) and not completed_professional then raise exception 'Required scoped professional review is incomplete'; end if;
  if requested_target='PASSED_WITH_NOTE' and notes_value is null and current_row.reviewer_notes_internal is null then raise exception 'Passed with note requires an explicit note'; end if;
  if requested_target='EXPIRED' and (current_row.recheck_at is null or current_row.recheck_at > now()) then raise exception 'Only a due check can be expired'; end if;
  if referral_value and referral_kind not in ('LAWYER','SURVEYOR','PLANNER','ENGINEER','OTHER') then raise exception 'A controlled professional referral type is required'; end if;
  update public.property_verifications set status=requested_target,
    scope_statement=coalesce(scope_value,scope_statement), reviewer_notes_internal=coalesce(notes_value,reviewer_notes_internal),
    limitations=coalesce(limitation_value,limitations), risk_level=coalesce(nullif(requested_payload->>'riskLevel','')::public.risk_level,risk_level),
    referral_required=case when requested_target='IN_REVIEW' then referral_required else referral_value end,
    referral_type=case when requested_target='IN_REVIEW' then referral_type when referral_value then referral_kind else null end,
    reviewed_by=case when requested_target in ('PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW') then requested_actor_id else reviewed_by end,
    reviewed_at=case when requested_target in ('PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW') then now() else reviewed_at end,
    check_date=case when requested_target in ('PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW') then current_date else check_date end,
    recheck_at=case when requested_target in ('PASSED','PASSED_WITH_NOTE') then coalesce(recheck_value, case when definition_row.recheck_days_default is not null then now() + make_interval(days=>definition_row.recheck_days_default) end) else recheck_at end,
    review_iteration=case when requested_target='IN_REVIEW' then review_iteration+1 else review_iteration end,
    public_visible=case when requested_target in ('PASSED','PASSED_WITH_NOTE') then public_visible else false end,
    public_disclosure_eligible=case when requested_target in ('PASSED','PASSED_WITH_NOTE') then public_disclosure_eligible else false end
    where id=current_row.id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(current_row.id,'STATUS_CHANGED',current_row.status,requested_target,requested_actor_id,
    current_row.review_iteration + case when requested_target='IN_REVIEW' then 1 else 0 end,nullif(btrim(requested_payload->>'reason'),''));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'VERIFICATION_CHANGE','property_verification',current_row.id,array['status','scope_statement','risk_level','recheck_at','referral_required'],
    jsonb_build_object('status',current_row.status),jsonb_build_object('status',requested_target,'riskLevel',coalesce(requested_payload->>'riskLevel',current_row.risk_level::text),'referralRequired',referral_value),'Scoped verification state changed; private notes and evidence omitted');
end;
$$;

create or replace function public.record_verification_exception(
  requested_actor_id uuid, requested_verification_id uuid, requested_payload jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid := gen_random_uuid(); current_row public.property_verifications%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.property_verifications where id=requested_verification_id for update;
  if not found then raise exception 'Verification check not found'; end if;
  insert into public.verification_exceptions(id,property_verification_id,severity,summary,limitation,blocks_public_disclosure,professional_referral_required,created_by)
  values(target_id,requested_verification_id,(requested_payload->>'severity')::public.risk_level,btrim(requested_payload->>'summary'),nullif(btrim(requested_payload->>'limitation'),''),coalesce((requested_payload->>'blocksPublicDisclosure')::boolean,true),coalesce((requested_payload->>'professionalReferralRequired')::boolean,false),requested_actor_id);
  update public.property_verifications set public_visible=false,public_disclosure_eligible=false,
    unresolved_exceptions_summary='One or more unresolved exceptions are recorded.' where id=requested_verification_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(requested_verification_id,'EXCEPTION_OPENED',current_row.status,current_row.status,requested_actor_id,current_row.review_iteration,'Exception recorded; confidential detail omitted');
  return target_id;
end;
$$;

create or replace function public.request_professional_review(
  requested_actor_id uuid, requested_verification_id uuid, requested_type text, requested_scope text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid := gen_random_uuid(); current_row public.property_verifications%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.property_verifications where id=requested_verification_id for update;
  if not found then raise exception 'Verification check not found'; end if;
  insert into public.professional_reviews(id,property_verification_id,professional_type,scope_statement,requested_by)
  values(target_id,requested_verification_id,requested_type,btrim(requested_scope),requested_actor_id);
  update public.property_verifications set referral_required=true,referral_type=requested_type,public_visible=false,public_disclosure_eligible=false where id=requested_verification_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(requested_verification_id,'PROFESSIONAL_REVIEW_REQUESTED',current_row.status,current_row.status,requested_actor_id,current_row.review_iteration,'Scoped professional referral requested');
  return target_id;
end;
$$;

create or replace function public.update_professional_review(
  requested_actor_id uuid, requested_review_id uuid, requested_target public.professional_review_status,
  requested_payload jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.professional_reviews%rowtype; verification_row public.property_verifications%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.professional_reviews where id=requested_review_id for update;
  if not found then raise exception 'Professional review not found'; end if;
  if not ((current_row.status='REQUESTED' and requested_target='MATERIALS_PENDING')
    or (current_row.status='MATERIALS_PENDING' and requested_target='IN_REVIEW')
    or (current_row.status='IN_REVIEW' and requested_target in ('COMPLETED','PARTIALLY_COMPLETED','REQUIRES_MORE_INFORMATION'))
    or (current_row.status='PARTIALLY_COMPLETED' and requested_target='IN_REVIEW')
    or (current_row.status='REQUIRES_MORE_INFORMATION' and requested_target='MATERIALS_PENDING')
    or (current_row.status='COMPLETED' and requested_target in ('SUPERSEDED','REQUIRES_REVIEW'))) then raise exception 'Invalid professional review transition'; end if;
  if requested_target='COMPLETED' and (length(btrim(coalesce(requested_payload->>'professionalName',''))) < 3
    or length(btrim(coalesce(requested_payload->>'outcome',''))) < 20
    or nullif(requested_payload->>'reviewDate','') is null) then raise exception 'Professional completion requires identity, date, and a scoped outcome'; end if;
  update public.professional_reviews set status=requested_target,
    professional_name=coalesce(nullif(btrim(requested_payload->>'professionalName'),''),professional_name),
    professional_reference=coalesce(nullif(btrim(requested_payload->>'professionalReference'),''),professional_reference),
    outcome_summary=coalesce(nullif(btrim(requested_payload->>'outcome'),''),outcome_summary),
    limitations=coalesce(nullif(btrim(requested_payload->>'limitations'),''),limitations),
    review_date=coalesce(nullif(requested_payload->>'reviewDate','')::date,review_date),
    evidence_reference=coalesce(nullif(btrim(requested_payload->>'evidenceReference'),''),evidence_reference),
    completed_by=case when requested_target='COMPLETED' then requested_actor_id else completed_by end,
    superseded_at=case when requested_target='SUPERSEDED' then now() else superseded_at end where id=requested_review_id;
  select * into verification_row from public.property_verifications where id=current_row.property_verification_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(current_row.property_verification_id,'PROFESSIONAL_REVIEW_'||requested_target,verification_row.status,verification_row.status,requested_actor_id,verification_row.review_iteration,'Professional review state changed; confidential outcome omitted');
end;
$$;

create or replace function public.resolve_verification_exception(
  requested_actor_id uuid, requested_exception_id uuid,
  requested_status public.verification_exception_status, requested_resolution text
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.verification_exceptions%rowtype; verification_row public.property_verifications%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if requested_status not in ('RESOLVED','ACCEPTED_LIMITATION') or length(btrim(coalesce(requested_resolution,''))) < 10 then raise exception 'A resolution or accepted limitation requires a specific explanation'; end if;
  select * into current_row from public.verification_exceptions where id=requested_exception_id and status='OPEN' for update;
  if not found then raise exception 'Open verification exception not found'; end if;
  update public.verification_exceptions set status=requested_status,resolved_at=now(),resolved_by=requested_actor_id,resolution_summary=btrim(requested_resolution) where id=requested_exception_id;
  select * into verification_row from public.property_verifications where id=current_row.property_verification_id;
  if not exists(select 1 from public.verification_exceptions where property_verification_id=current_row.property_verification_id and status='OPEN') then
    update public.property_verifications set unresolved_exceptions_summary=null where id=current_row.property_verification_id;
  end if;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(current_row.property_verification_id,'EXCEPTION_'||requested_status,verification_row.status,verification_row.status,requested_actor_id,verification_row.review_iteration,'Exception disposition recorded; confidential detail omitted');
end;
$$;

create or replace function public.create_verification_source_reference(
  requested_actor_id uuid, requested_payload jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid := gen_random_uuid(); source_kind public.verification_source_class := (requested_payload->>'sourceClass')::public.verification_source_class;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if length(btrim(coalesce(requested_payload->>'authorityName',''))) < 2 or length(btrim(coalesce(requested_payload->>'sourceSystem',''))) < 2 or length(btrim(coalesce(requested_payload->>'sourceName',''))) < 2 then raise exception 'Source authority, system, and name are required'; end if;
  insert into public.source_references(id,authority_name,source_system,document_or_service_name,source_url,reference_number,accessed_at,document_date,last_known_update_date,source_classification,source_class,record_identifier,certification_type,retrieval_method,snapshot_reference,source_version,notes)
  values(target_id,btrim(requested_payload->>'authorityName'),btrim(requested_payload->>'sourceSystem'),btrim(requested_payload->>'sourceName'),nullif(btrim(requested_payload->>'officialUrl'),''),nullif(btrim(requested_payload->>'referenceNumber'),''),coalesce(nullif(requested_payload->>'accessedAt','')::timestamptz,now()),nullif(requested_payload->>'recordDate','')::date,nullif(requested_payload->>'sourceUpdateDate','')::date,
    case source_kind when 'LEGAL_OFFICIAL_REQUIREMENT' then 'LEGAL_OFFICIAL' when 'OFFICIAL_ADMINISTRATIVE_PRACTICE' then 'ADMINISTRATIVE_PRACTICE' when 'PROFESSIONAL_DUE_DILIGENCE' then 'SECONDARY_COMMENTARY' else 'URBANEDGE_OBSERVED' end,
    source_kind,nullif(btrim(requested_payload->>'recordIdentifier'),''),nullif(btrim(requested_payload->>'certificationType'),''),nullif(btrim(requested_payload->>'retrievalMethod'),''),nullif(btrim(requested_payload->>'snapshotReference'),''),nullif(btrim(requested_payload->>'sourceVersion'),''),nullif(btrim(requested_payload->>'notes'),''));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state,reason)
  values(requested_actor_id,'VERIFICATION_CHANGE','source_reference',target_id,array['source_class','authority_name','source_system'],jsonb_build_object('sourceClass',source_kind,'authorityName',btrim(requested_payload->>'authorityName')),'Verification source reference recorded; private source detail omitted');
  return target_id;
end;
$$;

create or replace function public.set_verification_public_disclosure(
  requested_actor_id uuid, requested_verification_id uuid, requested_policy_id uuid, requested_visible boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare current_row public.property_verifications%rowtype; blocking_exception boolean; eligible_evidence boolean;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.property_verifications where id=requested_verification_id for update;
  if not found then raise exception 'Verification check not found'; end if;
  select exists(select 1 from public.verification_exceptions where property_verification_id=current_row.id and status='OPEN' and blocks_public_disclosure) into blocking_exception;
  select exists(select 1 from public.verification_evidence evidence left join public.private_documents document on document.id=evidence.private_document_id where evidence.property_verification_id=current_row.id and evidence.supports_check and evidence.provenance_state not in ('SUPERSEDED','REVOKED') and (document.id is null or (document.scan_status='CLEAN' and document.archived_at is null))) into eligible_evidence;
  if requested_visible and (current_row.status not in ('PASSED','PASSED_WITH_NOTE') or current_row.applicability<>'APPLICABLE' or current_row.reviewed_at is null or current_row.scope_statement is null or blocking_exception or not eligible_evidence) then raise exception 'Verification is not eligible for public disclosure'; end if;
  if requested_visible and not exists(select 1 from public.verification_public_copy_policies policy where policy.id=requested_policy_id and policy.check_definition_id=current_row.check_definition_id and policy.approval_status='APPROVED') then raise exception 'An approved lawyer-reviewed public-copy policy is required'; end if;
  update public.property_verifications set public_visible=requested_visible,public_disclosure_eligible=requested_visible,
    public_copy_policy_id=case when requested_visible then requested_policy_id else public_copy_policy_id end where id=requested_verification_id;
  insert into public.verification_history(property_verification_id,event_type,from_status,to_status,actor_admin_id,review_iteration,reason)
  values(requested_verification_id,'PUBLIC_DISCLOSURE_CHANGED',current_row.status,current_row.status,requested_actor_id,current_row.review_iteration,case when requested_visible then 'Enabled with approved copy policy' else 'Disabled' end);
end;
$$;

revoke all on function public.verification_provenance_rank(public.evidence_provenance_state) from public, anon, authenticated;
revoke all on function public.initialize_property_verifications(uuid,uuid) from public, anon, authenticated;
revoke all on function public.set_verification_applicability(uuid,uuid,public.verification_applicability,text) from public, anon, authenticated;
revoke all on function public.link_verification_evidence(uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.advance_verification_evidence(uuid,uuid,public.evidence_provenance_state,uuid) from public, anon, authenticated;
revoke all on function public.retire_verification_evidence(uuid,uuid,public.evidence_provenance_state,uuid,text) from public, anon, authenticated;
revoke all on function public.transition_property_verification(uuid,uuid,public.verification_status,jsonb) from public, anon, authenticated;
revoke all on function public.record_verification_exception(uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.request_professional_review(uuid,uuid,text,text) from public, anon, authenticated;
revoke all on function public.update_professional_review(uuid,uuid,public.professional_review_status,jsonb) from public, anon, authenticated;
revoke all on function public.resolve_verification_exception(uuid,uuid,public.verification_exception_status,text) from public, anon, authenticated;
revoke all on function public.create_verification_source_reference(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.set_verification_public_disclosure(uuid,uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.verification_provenance_rank(public.evidence_provenance_state) to service_role;
grant execute on function public.initialize_property_verifications(uuid,uuid) to service_role;
grant execute on function public.set_verification_applicability(uuid,uuid,public.verification_applicability,text) to service_role;
grant execute on function public.link_verification_evidence(uuid,uuid,jsonb) to service_role;
grant execute on function public.advance_verification_evidence(uuid,uuid,public.evidence_provenance_state,uuid) to service_role;
grant execute on function public.retire_verification_evidence(uuid,uuid,public.evidence_provenance_state,uuid,text) to service_role;
grant execute on function public.transition_property_verification(uuid,uuid,public.verification_status,jsonb) to service_role;
grant execute on function public.record_verification_exception(uuid,uuid,jsonb) to service_role;
grant execute on function public.request_professional_review(uuid,uuid,text,text) to service_role;
grant execute on function public.update_professional_review(uuid,uuid,public.professional_review_status,jsonb) to service_role;
grant execute on function public.resolve_verification_exception(uuid,uuid,public.verification_exception_status,text) to service_role;
grant execute on function public.create_verification_source_reference(uuid,jsonb) to service_role;
grant execute on function public.set_verification_public_disclosure(uuid,uuid,uuid,boolean) to service_role;

insert into public.verification_check_definitions
  (code,name,description_internal,category_scope,source_class,required_evidence,minimum_provenance,evidence_types,lawyer_review_required_by_default,surveyor_review_required_by_default,recheck_days_default,risk_if_failed,sort_order)
values
  ('PROPERTY_IDENTITY_REVIEWED','Property identity / parcel references','Compare property and parcel references to the recorded scope.',null,'OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'REVIEWED',array['OWNER_DOCUMENT','OFFICIAL_RECORD','SURVEY_MAP'],false,false,365,'HIGH',10),
  ('LOCATION_REVIEWED','Location correspondence','Compare recorded location and access context; this is not a boundary certification.',null,'URBANEDGE_OPERATIONAL_POLICY',true,'REVIEWED',array['SITE_OBSERVATION','PHOTOGRAPHIC_OBSERVATION','SURVEY_MAP'],false,false,365,'MEDIUM',20),
  ('SITE_VISIT_COMPLETED','Site-related evidence','Record the scope and date of a site observation.',null,'URBANEDGE_OPERATIONAL_POLICY',true,'REVIEWED',array['SITE_OBSERVATION','PHOTOGRAPHIC_OBSERVATION'],false,false,365,'LOW',30),
  ('ACCESS_EVIDENCE_REVIEWED','Access / frontage evidence','Review only the recorded access or frontage evidence.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'REVIEWED',array['SITE_OBSERVATION','SURVEY_MAP','OFFICIAL_RECORD'],false,false,365,'MEDIUM',40),
  ('REGISTRATION_RECORDS_REVIEWED','Registration / Index-2 records','Scoped registration-record review; not a complete title conclusion.',null,'OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_SEARCH_RESULT','REGISTERED_INSTRUMENT','CERTIFIED_OFFICIAL_RECORD'],false,false,180,'HIGH',50),
  ('ENCUMBRANCE_SEARCH_REVIEWED','Encumbrance / search review','Scoped search against the recorded source and period.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['OFFICIAL_SEARCH_RESULT','COURT_OR_REVENUE_SEARCH'],true,false,90,'HIGH',60),
  ('LITIGATION_SCREENING_REVIEWED','Litigation / government-claim screening','Screen only the named sources, parties, parcel references and period.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['COURT_OR_REVENUE_SEARCH','PROFESSIONAL_REPORT'],true,false,90,'CRITICAL',70),
  ('LEGAL_REVIEW_COMPLETED','Professional legal review — scoped','Qualified legal review for the recorded issue and material only.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'PROFESSIONALLY_REVIEWED',array['PROFESSIONAL_REPORT','PROFESSIONAL_OPINION'],true,false,180,'HIGH',80),
  ('SURVEYOR_REVIEW_COMPLETED','Professional survey review — scoped','Qualified survey review for the recorded parcel or measurement scope.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'PROFESSIONALLY_REVIEWED',array['PROFESSIONAL_REPORT','MAPNI_RECORD','SURVEY_MAP'],false,true,365,'HIGH',90),
  ('PLANNING_REVIEW_COMPLETED','Professional planning review — scoped','Qualified planning review for the recorded zoning/planning issue.',null,'PROFESSIONAL_DUE_DILIGENCE',true,'PROFESSIONALLY_REVIEWED',array['PROFESSIONAL_REPORT','PROFESSIONAL_OPINION'],false,false,180,'HIGH',100),
  ('REVENUE_RECORDS_REVIEWED','Revenue records reviewed','Review applicable revenue records to the recorded parcel/date scope.','AGRICULTURAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','CERTIFIED_OFFICIAL_RECORD','OFFICIAL_PORTAL_RESULT'],false,false,90,'HIGH',200),
  ('VF7_REVIEWED','VF-7 reference reviewed','Review VF-7 only where applicable to the parcel and jurisdiction.','AGRICULTURAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','CERTIFIED_OFFICIAL_RECORD','OFFICIAL_PORTAL_RESULT'],false,false,90,'HIGH',210),
  ('VF8A_REVIEWED','VF-8A reference reviewed','Review VF-8A only where applicable to the parcel and jurisdiction.','AGRICULTURAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','CERTIFIED_OFFICIAL_RECORD','OFFICIAL_PORTAL_RESULT'],false,false,90,'HIGH',220),
  ('VF6_MUTATION_REVIEWED','VF-6 / mutation references reviewed','Review recorded mutation references and limitations.','AGRICULTURAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','CERTIFIED_OFFICIAL_RECORD','OFFICIAL_PORTAL_RESULT'],false,false,90,'HIGH',230),
  ('TENURE_RESTRICTION_REVIEWED','Tenure / restrictions reviewed','Review recorded tenure and restriction evidence for the stated transaction.','AGRICULTURAL','PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','REGISTERED_INSTRUMENT','PROFESSIONAL_REPORT'],true,false,180,'CRITICAL',240),
  ('SURVEY_MAPNI_EVIDENCE_REVIEWED','Survey / mapni evidence reviewed','Review available survey/mapni material without certifying boundaries.','AGRICULTURAL','PROFESSIONAL_DUE_DILIGENCE',true,'REVIEWED',array['SURVEY_MAP','MAPNI_RECORD','PROFESSIONAL_REPORT'],false,true,365,'HIGH',250),
  ('NA_ORDER_REVIEWED','NA status / order reviewed','Review the recorded NA order/status; this does not guarantee development entitlement.','NA','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['AUTHORITY_ORDER','CERTIFIED_OFFICIAL_RECORD','OFFICIAL_PORTAL_RESULT'],false,false,180,'CRITICAL',300),
  ('NA_PURPOSE_REVIEWED','NA purpose reviewed','Review the purpose stated in the applicable NA material.','NA','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['AUTHORITY_ORDER','CERTIFIED_OFFICIAL_RECORD'],false,false,180,'HIGH',310),
  ('PLANNING_CHECK_REVIEWED','Planning / zoning checked','Review planning authority, DP/TP or zoning evidence to the recorded scope.','NA','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','AUTHORITY_LETTER','OFFICIAL_PORTAL_RESULT'],false,false,180,'HIGH',320),
  ('TP_FP_OP_REVIEWED','TP / OP / FP references reviewed','Review available scheme and plot references without inferring buildability.','NA','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','AUTHORITY_ORDER','SURVEY_MAP'],false,false,180,'HIGH',330),
  ('DEVELOPMENT_PERMISSION_REVIEWED','Development-related evidence reviewed','Review only the identified permission evidence; NA alone is insufficient.','NA','PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['AUTHORITY_ORDER','AUTHORITY_LETTER','PROFESSIONAL_REPORT'],false,false,90,'CRITICAL',340),
  ('INDUSTRIAL_DESIGNATION_REVIEWED','Industrial designation / permitted use reviewed','Review the recorded permitted-use evidence; industrial does not permit every use.','INDUSTRIAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['AUTHORITY_ORDER','AUTHORITY_LETTER','OFFICIAL_RECORD'],false,false,180,'CRITICAL',400),
  ('GIDC_RECORDS_REVIEWED','GIDC / private-industrial distinction reviewed','Record whether the parcel is GIDC or private industrial; no freehold inference.','INDUSTRIAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['OFFICIAL_RECORD','AUTHORITY_LETTER','OFFICIAL_PORTAL_RESULT'],false,false,180,'HIGH',410),
  ('GIDC_ALLOTMENT_REVIEWED','Industrial allotment evidence reviewed','Review applicable allotment evidence and its recorded limitations.','INDUSTRIAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['AUTHORITY_ORDER','AUTHORITY_LETTER','REGISTERED_INSTRUMENT'],false,false,180,'HIGH',420),
  ('GIDC_LEASE_REVIEWED','Industrial lease / tenure evidence reviewed','Review lease or tenure evidence; GIDC does not imply freehold ownership.','INDUSTRIAL','PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['REGISTERED_INSTRUMENT','AUTHORITY_ORDER','PROFESSIONAL_REPORT'],true,false,180,'CRITICAL',430),
  ('GIDC_TRANSFER_REVIEWED','Industrial transfer status reviewed','Review applicable transfer evidence and conditions.','INDUSTRIAL','OFFICIAL_ADMINISTRATIVE_PRACTICE',true,'SOURCE_VERIFIED',array['AUTHORITY_LETTER','AUTHORITY_ORDER','REGISTERED_INSTRUMENT'],false,false,90,'CRITICAL',440),
  ('GIDC_USE_COMPLIANCE_REVIEWED','Industrial permitted-use evidence reviewed','Review use evidence to the stated industry/activity only.','INDUSTRIAL','PROFESSIONAL_DUE_DILIGENCE',true,'SOURCE_VERIFIED',array['AUTHORITY_LETTER','AUTHORITY_ORDER','PROFESSIONAL_REPORT'],false,false,90,'CRITICAL',450)
on conflict (code) do nothing;

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
drop view public.public_property_verification_summaries;

create view public.public_property_verification_summaries
with (security_invoker = true) as
select pv.id, pv.property_id, definition.code as check_code,
  policy.label, policy.explanation_template as explanation,
  case pv.status when 'PASSED' then 'COMPLETED' when 'PASSED_WITH_NOTE' then 'COMPLETED_WITH_NOTE' end as public_status,
  pv.reviewed_at, pv.check_date, pv.scope_statement as scope,
  coalesce(pv.public_limitation, policy.limitation_template) as limitation,
  definition.source_class
from public.property_verifications pv
join public.verification_check_definitions definition on definition.id=pv.check_definition_id
join public.verification_public_copy_policies policy on policy.id=pv.public_copy_policy_id and policy.approval_status='APPROVED'
join public.properties property on property.id=pv.property_id
where property.publication_status='PUBLISHED' and property.deleted_at is null and property.archived_at is null
  and pv.public_visible and pv.public_disclosure_eligible and pv.applicability='APPLICABLE'
  and pv.status in ('PASSED','PASSED_WITH_NOTE') and (pv.recheck_at is null or pv.recheck_at>now())
  and not exists(select 1 from public.verification_exceptions exception where exception.property_verification_id=pv.id and exception.status='OPEN' and exception.blocks_public_disclosure)
  and exists(select 1 from public.verification_evidence evidence left join public.private_documents document on document.id=evidence.private_document_id where evidence.property_verification_id=pv.id and evidence.supports_check and evidence.provenance_state not in ('SUPERSEDED','REVOKED') and (document.id is null or (document.scan_status='CLEAN' and document.archived_at is null)));

comment on view public.public_property_verification_summaries is 'Explicit scoped public output only; excludes evidence, private documents, source metadata, reviewer notes, risk, coordinates and PII.';
alter view public.public_property_verification_summaries set (security_invoker = false);
grant create on schema public to urbanedge_public_projection;
alter view public.public_property_verification_summaries owner to urbanedge_public_projection;
grant select on public.verification_public_copy_policies, public.verification_evidence,
  public.verification_exceptions, public.private_documents to urbanedge_public_projection;
create policy projection_approved_public_copy on public.verification_public_copy_policies for select to urbanedge_public_projection using (approval_status='APPROVED');
create policy projection_current_verification_evidence on public.verification_evidence for select to urbanedge_public_projection using (
  provenance_state not in ('SUPERSEDED','REVOKED') and supports_check and exists (
    select 1 from public.property_verifications verification
    join public.properties property on property.id=verification.property_id
    where verification.id=verification_evidence.property_verification_id
      and verification.public_visible and verification.public_disclosure_eligible
      and verification.status in ('PASSED','PASSED_WITH_NOTE')
      and property.publication_status='PUBLISHED' and property.archived_at is null and property.deleted_at is null
  )
);
create policy projection_verification_exceptions on public.verification_exceptions for select to urbanedge_public_projection using (
  exists (
    select 1 from public.property_verifications verification
    join public.properties property on property.id=verification.property_id
    where verification.id=verification_exceptions.property_verification_id
      and verification.public_visible and verification.public_disclosure_eligible
      and verification.status in ('PASSED','PASSED_WITH_NOTE')
      and property.publication_status='PUBLISHED' and property.archived_at is null and property.deleted_at is null
  )
);
create policy projection_clean_linked_private_documents on public.private_documents for select to urbanedge_public_projection using (
  scan_status='CLEAN' and archived_at is null and exists (
    select 1 from public.verification_evidence evidence
    join public.property_verifications verification on verification.id=evidence.property_verification_id
    join public.properties property on property.id=verification.property_id
    where evidence.private_document_id=private_documents.id and evidence.supports_check
      and evidence.provenance_state not in ('SUPERSEDED','REVOKED')
      and verification.public_visible and verification.public_disclosure_eligible
      and verification.status in ('PASSED','PASSED_WITH_NOTE')
      and property.publication_status='PUBLISHED' and property.archived_at is null and property.deleted_at is null
  )
);
set role urbanedge_public_projection;
grant select on public.public_property_verification_summaries to anon, authenticated;
reset role;
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

comment on table public.verification_public_copy_policies is 'Lawyer-approval gate. M8 seeds no approved public copy.';
