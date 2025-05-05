create table public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  check_in_time timestamptz not null default now(),
  checked_in_by text not null
);

create index idx_daily_check_in_time on public.daily_check_ins (check_in_time desc);
