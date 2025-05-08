create table if not exists public.member_friends (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  friend_id uuid not null references public.members(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),

  -- constraint to prevent duplicate friendships
  constraint unique_friend_pair unique (member_id, friend_id)
);
