-- ─────────────────────────────────────────────────────────────────────────────
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: profiles (auto-created on signup via trigger)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: incomes
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.incomes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null,
  description text not null,
  category    text,
  created_at  timestamptz not null default now()
);

create index if not exists incomes_user_id_idx on public.incomes (user_id);
create index if not exists incomes_date_idx    on public.incomes (date desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: expenses
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null,
  description text not null,
  category    text not null default 'other',
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_id_idx  on public.expenses (user_id);
create index if not exists expenses_date_idx     on public.expenses (date desc);
create index if not exists expenses_category_idx on public.expenses (category);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: fixed_expenses
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.fixed_expenses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       numeric(12, 2) not null check (amount > 0),
  description  text not null,
  category     text not null default 'other',
  day_of_month smallint check (day_of_month between 1 and 31),
  created_at   timestamptz not null default now()
);

create index if not exists fixed_expenses_user_id_idx on public.fixed_expenses (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.incomes         enable row level security;
alter table public.expenses        enable row level security;
alter table public.fixed_expenses  enable row level security;

-- profiles
create policy "profiles: own row read"   on public.profiles
  for select using ( auth.uid() = id );
create policy "profiles: own row update" on public.profiles
  for update using ( auth.uid() = id );

-- incomes
create policy "incomes: select own" on public.incomes
  for select using ( auth.uid() = user_id );
create policy "incomes: insert own" on public.incomes
  for insert with check ( auth.uid() = user_id );
create policy "incomes: update own" on public.incomes
  for update using ( auth.uid() = user_id );
create policy "incomes: delete own" on public.incomes
  for delete using ( auth.uid() = user_id );

-- expenses
create policy "expenses: select own" on public.expenses
  for select using ( auth.uid() = user_id );
create policy "expenses: insert own" on public.expenses
  for insert with check ( auth.uid() = user_id );
create policy "expenses: update own" on public.expenses
  for update using ( auth.uid() = user_id );
create policy "expenses: delete own" on public.expenses
  for delete using ( auth.uid() = user_id );

-- fixed_expenses
create policy "fixed_expenses: select own" on public.fixed_expenses
  for select using ( auth.uid() = user_id );
create policy "fixed_expenses: insert own" on public.fixed_expenses
  for insert with check ( auth.uid() = user_id );
create policy "fixed_expenses: update own" on public.fixed_expenses
  for update using ( auth.uid() = user_id );
create policy "fixed_expenses: delete own" on public.fixed_expenses
  for delete using ( auth.uid() = user_id );

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: loans
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.loans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  lent_date   date not null,
  status      text not null default 'pending' check (status in ('pending', 'paid')),
  paid_date   date,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists loans_user_id_idx on public.loans (user_id);

alter table public.loans enable row level security;

create policy "loans: select own" on public.loans
  for select using ( auth.uid() = user_id );
create policy "loans: insert own" on public.loans
  for insert with check ( auth.uid() = user_id );
create policy "loans: update own" on public.loans
  for update using ( auth.uid() = user_id );
create policy "loans: delete own" on public.loans
  for delete using ( auth.uid() = user_id );
