-- Execute no SQL Editor do projeto Supabase. Nenhuma senha ou chave neste arquivo.
create table if not exists public.financial_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{"entries":[],"debts":[],"reserve":20}'::jsonb,
  version bigint not null default 0 check (version >= 0)
);
alter table public.financial_state enable row level security;
revoke all on public.financial_state from anon;
grant select, insert, update on public.financial_state to authenticated;
drop policy if exists own_finances on public.financial_state;
create policy own_finances on public.financial_state for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.save_financial_state(new_state jsonb, expected_version bigint)
returns bigint language sql security invoker set search_path = public as $$
  update public.financial_state set state = new_state, version = version + 1
  where user_id = (select auth.uid()) and version = expected_version
  returning version;
$$;
revoke all on function public.save_financial_state(jsonb,bigint) from public, anon;
grant execute on function public.save_financial_state(jsonb,bigint) to authenticated;
