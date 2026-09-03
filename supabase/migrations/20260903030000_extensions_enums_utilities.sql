create extension if not exists pgcrypto with schema extensions;

create type public.land_category as enum ('AGRICULTURAL', 'NA', 'INDUSTRIAL');
create type public.transaction_type as enum ('BUY', 'RENT', 'LEASE');
create type public.property_publication_status as enum ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
create type public.property_availability_status as enum ('AVAILABLE', 'UNDER_NEGOTIATION', 'SOLD', 'RENTED', 'LEASED', 'OFF_MARKET');
create type public.location_visibility as enum ('EXACT', 'APPROXIMATE', 'HIDDEN');
create type public.price_mode as enum ('PRICE_ON_REQUEST', 'EXACT_TOTAL', 'PRICE_RANGE', 'PER_UNIT');
create type public.area_normalization_status as enum ('AUTHORITATIVE', 'SOURCE_DECLARED', 'PROVISIONAL', 'UNKNOWN');
create type public.party_type as enum ('INDIVIDUAL', 'COMPANY', 'PARTNERSHIP', 'TRUST', 'SOCIETY', 'GOVERNMENT', 'OTHER');
create type public.property_party_role as enum ('OWNER', 'CO_OWNER', 'AUTHORIZED_REPRESENTATIVE', 'BROKER', 'INTERMEDIARY', 'DEVELOPER', 'INSTITUTIONAL_OWNER', 'OTHER');
create type public.media_type as enum ('IMAGE', 'VIDEO', 'PANORAMA_360', 'BROCHURE', 'DOCUMENT_PREVIEW', 'MAP_IMAGE', 'OTHER');
create type public.record_visibility as enum ('PUBLIC', 'ADMIN_ONLY', 'PRIVATE');
create type public.verification_status as enum ('NOT_STARTED', 'IN_REVIEW', 'PASSED', 'PASSED_WITH_NOTE', 'FAILED', 'REQUIRES_REVIEW', 'EXPIRED');
create type public.risk_level as enum ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type public.owner_submission_status as enum ('NEW', 'CONTACTED', 'DOCS_REQUESTED', 'UNDER_REVIEW', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'ON_HOLD', 'CONVERTED', 'CLOSED');
create type public.lead_status as enum ('NEW', 'CONTACT_ATTEMPTED', 'QUALIFIED', 'REQUIREMENT_CONFIRMED', 'PROPERTY_MATCHED', 'SITE_VISIT_REQUESTED', 'SITE_VISIT_CONFIRMED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'WON', 'LOST', 'NURTURE', 'CLOSED');
create type public.lead_inquiry_type as enum ('PROPERTY_INQUIRY', 'PRICE_INQUIRY', 'WHATSAPP_CLICK', 'CALL_CLICK', 'BUYER_REQUIREMENT', 'SITE_VISIT_REQUEST', 'GENERAL_CONTACT');
create type public.buyer_type as enum ('INDIVIDUAL', 'INVESTOR', 'FARMER', 'DEVELOPER', 'BUILDER', 'INDUSTRIAL_BUSINESS', 'LOGISTICS_OPERATOR', 'NRI', 'BROKER', 'OTHER');
create type public.lead_activity_type as enum ('LEAD_CREATED', 'CONTACT_ATTEMPTED', 'CONTACTED', 'NOTE_ADDED', 'WHATSAPP_CLICK', 'CALL_CLICK', 'REQUIREMENT_UPDATED', 'PROPERTY_MATCHED', 'SITE_VISIT_REQUESTED', 'SITE_VISIT_CONFIRMED', 'SITE_VISIT_COMPLETED', 'OFFER_RECEIVED', 'FOLLOW_UP_SCHEDULED', 'STATUS_CHANGED', 'DOCUMENT_REQUESTED', 'OTHER');
create type public.site_visit_status as enum ('REQUESTED', 'CONTACTED', 'PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');
create type public.guide_status as enum ('DRAFT', 'REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
create type public.attribute_value_type as enum ('TEXT', 'LONG_TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'SINGLE_OPTION', 'MULTI_OPTION');
create type public.seo_page_status as enum ('DRAFT', 'REVIEW', 'PUBLISHED', 'NOINDEX', 'ARCHIVED');
create type public.setting_value_type as enum ('TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'URL', 'JSON');
create type public.audit_action as enum ('CREATE', 'UPDATE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'RESTORE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'DOCUMENT_ACCESS', 'VERIFICATION_CHANGE', 'STATUS_CHANGE');

create sequence public.property_code_seq as bigint start with 1 no cycle;
create sequence public.owner_submission_reference_seq as bigint start with 1 no cycle;
create sequence public.lead_reference_seq as bigint start with 1 no cycle;
create sequence public.site_visit_reference_seq as bigint start with 1 no cycle;

create function public.next_property_code() returns text language sql volatile set search_path = '' as $$
  select 'UE-LS-' || lpad(nextval('public.property_code_seq')::text, 6, '0');
$$;
create function public.next_owner_submission_reference() returns text language sql volatile set search_path = '' as $$
  select 'UE-OWN-' || lpad(nextval('public.owner_submission_reference_seq')::text, 8, '0');
$$;
create function public.next_lead_reference() returns text language sql volatile set search_path = '' as $$
  select 'UE-LEAD-' || lpad(nextval('public.lead_reference_seq')::text, 7, '0');
$$;
create function public.next_site_visit_reference() returns text language sql volatile set search_path = '' as $$
  select 'UE-VISIT-' || lpad(nextval('public.site_visit_reference_seq')::text, 6, '0');
$$;

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.prevent_column_change() returns trigger language plpgsql set search_path = '' as $$
begin
  if to_jsonb(new) -> tg_argv[0] is distinct from to_jsonb(old) -> tg_argv[0] then
    raise exception '% is immutable', tg_argv[0];
  end if;
  return new;
end;
$$;

comment on type public.site_visit_status is 'ADR-0001 canonical lifecycle; FOLLOW_UP_REQUIRED is intentionally excluded';
