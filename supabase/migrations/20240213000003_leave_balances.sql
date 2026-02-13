-- Create Leave Balances Table
create table leave_balances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  annual_total integer default 20,
  annual_used integer default 0,
  sick_total integer default 10,
  sick_used integer default 0,
  casual_total integer default 5,
  casual_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table leave_balances enable row level security;

-- Policies
create policy "Users can view own leave balance"
  on leave_balances for select
  using ( auth.uid() = user_id );

create policy "HR Admin can view all leave balances"
  on leave_balances for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

create policy "HR Admin can update all leave balances"
  on leave_balances for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- Helper to initialize balance for existing users (Run manually if needed, or trigger)
insert into leave_balances (user_id)
select id from profiles
where not exists (select 1 from leave_balances where user_id = profiles.id);
