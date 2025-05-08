create table if not exists public.walk_ins (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  mailing_list boolean default false,
  friend_of uuid references public.members(id) on delete set null,
  created_at timestamp with time zone default timezone('utc', now())
);
