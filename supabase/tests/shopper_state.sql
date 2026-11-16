-- Run on a disposable/local PostgreSQL instance. Every fixture is rolled back.
begin;
select set_config('test.shopper_a',gen_random_uuid()::text,true);
select set_config('test.shopper_b',gen_random_uuid()::text,true);
insert into auth.users(id,email_confirmed_at) values(current_setting('test.shopper_a')::uuid,now()),(current_setting('test.shopper_b')::uuid,now());
select set_config('request.jwt.claim.sub',current_setting('test.shopper_a'),true);
set local role authenticated;
do $$
declare owner_id uuid := current_setting('test.shopper_a')::uuid; operation_id uuid := gen_random_uuid(); merge_id uuid := gen_random_uuid(); result jsonb; item jsonb := '{"id":"line","productId":"piece","variantId":"black","title":"Shirt","image":"/shirt.webp","price":25000,"quantity":1,"size":"M","color":"Black"}'; op jsonb; denied boolean;
begin
  op := jsonb_build_object('id',operation_id,'kind','delta','key','line','item',item,'delta',5,'base',0,'restore',true);
  result := public.sync_shopper(owner_id,jsonb_build_array(op));
  assert result->'document'->'cart'->'line'->>'quantity'='5', 'Initial quantity';
  result := public.sync_shopper(owner_id,jsonb_build_array(op));
  assert result->'document'->'cart'->'line'->>'quantity'='5', 'Retry must not double quantity';
  denied := false;
  begin perform public.sync_shopper(current_setting('test.shopper_b')::uuid,'[]'); exception when insufficient_privilege then denied := true; end;
  assert denied, 'A customer must not access another customer';
  denied := false;
  begin perform * from public.shopper_state; exception when insufficient_privilege then denied := true; end;
  assert denied, 'No direct table access';
  result := public.sync_shopper(owner_id,jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'kind','remove','key','line','base',1)));
  result := public.sync_shopper(owner_id,jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'kind','delta','key','line','item',item,'delta',1,'base',0)));
  assert not (result->'document'->'cart' ? 'line'), 'Stale device cannot resurrect deleted line';
  assert jsonb_array_length(result->'adjusted')=1, 'Conflict is reported';
  result := public.sync_shopper(owner_id,jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'kind','delta','key','line','item',item,'delta',1,'base',3,'restore',true)));
  assert result->'document'->'cart'->'line'->>'quantity'='1', 'Deliberate re-add';
  op := jsonb_build_object('id',merge_id,'kind','merge','cart',jsonb_build_array(item || '{"quantity":2}'),'wishlist','["piece"]'::jsonb,'base',0);
  -- Use a fresh line for the import; an existing deletion tombstone wins over an old guest snapshot.
  op := jsonb_set(op,'{cart,0,id}','"guest-line"');
  result := public.sync_shopper(owner_id,jsonb_build_array(op));
  assert result->'document'->'cart'->'guest-line'->>'quantity'='2';
  result := public.sync_shopper(owner_id,jsonb_build_array(op));
  assert result->'document'->'cart'->'guest-line'->>'quantity'='2', 'Guest import is once-only';
  assert result->'document'->'wishlist'->>'piece'='true';
  denied := false;
  begin perform public.sync_shopper(owner_id,jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'kind','wish','key','__proto__','enabled',true,'base',0))); exception when raise_exception then denied := true; end;
  assert denied, 'Invalid keys are rejected';
end $$;
reset role;
do $$ begin
  assert not has_function_privilege('anon','public.sync_shopper(uuid,jsonb)','execute');
  assert not has_function_privilege('authenticated','public.apply_shopper_operation(jsonb,jsonb)','execute');
end $$;
rollback;
