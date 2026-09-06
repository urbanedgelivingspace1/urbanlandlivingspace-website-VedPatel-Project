begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(44);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('96000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m16-admin@example.invalid','',now(),'{}','{}',now(),now()),
('96000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m16-inactive@example.invalid','',now(),'{}','{}',now(),now()),
('96000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m16-user@example.invalid','',now(),'{}','{}',now(),now());
insert into public.admin_profiles(user_id,display_name,role,is_active)
values
('96000000-0000-4000-8000-000000000001','M16 Admin','CONTENT_EDITOR',true),
('96000000-0000-4000-8000-000000000002','M16 Inactive','CONTENT_EDITOR',false);

select has_table('public','seo_redirects','durable canonical redirects exist');
select has_view('public','public_seo_redirects','redirects have a narrow active projection');
select has_column('public','guides','hero_object_path','guides support controlled public hero media');
select has_column('public','public_seo_pages','status','public SEO pages expose the explicit crawl status');
select has_function('public','record_seo_redirect',array['uuid','text','text','text','uuid'],'redirect recording is a controlled service function');
select has_function('public','migrate_published_guide_slug',array['uuid','uuid','text'],'published guide slug migration is atomic');
select ok((select relrowsecurity from pg_class where oid='public.seo_redirects'::regclass),'redirect history has RLS');
select ok((select relforcerowsecurity from pg_class where oid='public.seo_redirects'::regclass),'redirect history forces RLS');
select is((select count(*)::integer from pg_policies where schemaname='public' and tablename='seo_redirects'),2,'redirects have admin and public-projection policies only');
select is((select count(*)::integer from public.guide_categories where id::text like '16000000-%'),3,'three bounded guide categories are seeded');
select is((select count(*)::integer from public.public_guides where id='16000000-0000-4000-8000-000000000010'),1,'the reviewed baseline guide is publicly projected');
select is((select count(*)::integer from public.seo_pages where id::text like '16000000-%'),8,'only eight V1 location routes are curated');
select ok((select bool_and(status='NOINDEX') from public.seo_pages where id::text like '16000000-%'),'seeded location pages launch public but noindex');
select is((select count(district_id)::integer from public.seo_pages where id::text like '16000000-%'),8,'all curated location pages map to a V1 district');
select hasnt_column('public','public_guides','author_admin_id','public guide projection omits the author identity');
select hasnt_column('public','public_guides','published_by','public guide projection omits the publisher identity');

set local role service_role;
select set_config('request.jwt.claims',json_build_object('role','service_role')::text,true);
select throws_ok($$insert into public.guides(title,slug,body_markdown,status,published_at) values('Duplicate guide','PRACTICAL-CHECKLIST-BEFORE-ENQUIRING-ABOUT-LAND','Useful body','PUBLISHED',now())$$,'23514',null,'guide slug format is enforced before uniqueness');
select throws_ok($$insert into public.guides(title,slug,body_markdown) values('Bad slug guide','bad_slug','Useful body')$$,'23514',null,'unsafe guide slug shapes are rejected');
select throws_ok($$insert into public.seo_pages(page_type,slug,title) values('DISTRICT','locations/surat','Unapproved route')$$,'23514',null,'unapproved geography routes cannot be created');
select lives_ok($$insert into public.guides(id,title,slug,excerpt,body_markdown,status,seo_title,seo_description,canonical_url) values('96000000-0000-4000-8000-000000000010','M16 private draft','m16-private-draft','PRIVATE_M16_DRAFT_CANARY','PRIVATE_M16_DRAFT_BODY_CANARY','DRAFT','PRIVATE_M16_DRAFT_SEO_CANARY','PRIVATE_M16_DRAFT_DESCRIPTION_CANARY','/guides/m16-private-draft')$$,'a valid draft guide remains private');
select lives_ok($$insert into public.guides(id,title,slug,excerpt,body_markdown,status,published_at,seo_title,seo_description,canonical_url) values('96000000-0000-4000-8000-000000000011','M16 route migration guide','m16-original-guide','Public route migration fixture','Useful public route migration body','PUBLISHED',now(),'M16 route migration','Public route migration description','/guides/m16-original-guide')$$,'a published guide fixture can be created');
select lives_ok($$select public.migrate_published_guide_slug('96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000011','m16-current-guide')$$,'published guide slug and redirect migrate atomically');
select is((select destination_path from public.seo_redirects where source_path='/guides/m16-original-guide'),'/guides/m16-current-guide','old published guide path points directly to the new canonical');
select is((select count(*)::integer from public.public_guides where slug='m16-current-guide'),1,'public guide projection exposes only the migrated slug');
select throws_ok($$select public.record_seo_redirect('96000000-0000-4000-8000-000000000002','/legacy-one','/guides/practical-checklist-before-enquiring-about-land','ROUTE',null)$$,'42501','Active admin actor required','inactive actor cannot record a redirect through service role');
select lives_ok($$select public.record_seo_redirect('96000000-0000-4000-8000-000000000001','/legacy-one','/guides/practical-checklist-before-enquiring-about-land','ROUTE',null)$$,'active admin actor may record a bounded redirect');
select lives_ok($$select public.record_seo_redirect('96000000-0000-4000-8000-000000000001','/old-alias','/legacy-one','ROUTE',null)$$,'a second known alias may target the prior canonical path');
select lives_ok($$select public.record_seo_redirect('96000000-0000-4000-8000-000000000001','/legacy-one','/guides/current-checklist','ROUTE',null)$$,'updating a canonical route remains durable');
select is((select destination_path from public.seo_redirects where source_path='/old-alias'),'/guides/current-checklist','redirect chains are flattened without touching unrelated entity rows');
select is((select count(*)::integer from public.audit_logs where entity_type='seo_redirect'),4,'every redirect mutation is audited');
select throws_ok($$select public.record_seo_redirect('96000000-0000-4000-8000-000000000001','/same','/same','ROUTE',null)$$,'22023','Redirect source and destination must differ','redirect loops are rejected');
reset role;

set local role anon;
select ok(has_table_privilege(current_user,'public.public_seo_redirects','select'),'anonymous may read the active redirect projection');
select is((select count(*)::integer from public.public_guides where id='96000000-0000-4000-8000-000000000010'),0,'draft guide is absent from the anonymous projection');
select is((select count(*)::integer from public.public_seo_pages where id::text like '16000000-%'),8,'NOINDEX location pages remain publicly useful');
select ok((select bool_and(status='NOINDEX') from public.public_seo_pages where id::text like '16000000-%'),'anonymous projection preserves explicit noindex status');
select ok(not has_table_privilege(current_user,'public.guides','select'),'anonymous cannot read the guide base table');
select ok(not has_table_privilege(current_user,'public.seo_redirects','update'),'anonymous cannot mutate redirects');
select ok(not has_function_privilege(current_user,'public.record_seo_redirect(uuid,text,text,text,uuid)','execute'),'anonymous cannot execute redirect mutation');
select is((select count(*)::integer from public.public_seo_redirects),3,'anonymous sees only the three active redirect aliases');
select is((select count(*)::integer from information_schema.columns where table_schema='public' and table_name='public_seo_redirects'),3,'redirect projection contains only safe routing fields');
reset role;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select is((select count(*)::integer from public.seo_redirects),0,'authenticated non-admin cannot read redirect history');
reset role;

select set_config('request.jwt.claim.sub','96000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claim.role','authenticated',true);
set local role authenticated;
select is((select count(*)::integer from public.seo_redirects),3,'active admin may inspect redirect history');
select ok(not has_table_privilege(current_user,'public.seo_redirects','update'),'active admin cannot bypass the redirect function for writes');
select ok(not has_function_privilege(current_user,'public.record_seo_redirect(uuid,text,text,text,uuid)','execute'),'active admin browser cannot execute the service-only redirect function');
reset role;

select * from finish();
rollback;
