-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Reset Schema (Idempotency)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists support_staff_details;
drop table if exists core_staff_details;
drop table if exists profiles;
drop type if exists leave_status;
drop type if exists employment_status;
drop type if exists user_role;

-- Create Enum Types
create type user_role as enum ('hr_admin', 'line_manager', 'core_staff', 'support_staff');
create type employment_status as enum ('confirmed', 'contract', 'probation', 'disengaged');
create type leave_status as enum ('pending', 'approved', 'declined');

-- Create Profiles Table (Base table extensions auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role user_role not null default 'core_staff',
  full_name text not null,
  avatar_url text,
  phone_number text,
  residential_address text,
  emergency_contact text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table profiles enable row level security;

-- Create Core Staff Details Table
create table core_staff_details (
  id uuid references profiles(id) on delete cascade not null primary key,
  staff_id text unique not null,
  job_title text not null,
  department text not null,
  unit text,
  line_manager_id uuid references profiles(id),
  date_of_employment date not null,
  date_of_birth date,
  gender text,
  employment_status employment_status not null default 'probation',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Core Staff Details
alter table core_staff_details enable row level security;

-- Create Support Staff Details Table
create table support_staff_details (
  id uuid references profiles(id) on delete cascade not null primary key,
  date_of_engagement date not null,
  project_assignment text not null,
  project_location text not null,
  deployment_start_date date not null,
  deployment_end_date date,
  supervisor_name text not null,
  status text default 'Active',
  next_of_kin text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Support Staff Details
alter table support_staff_details enable row level security;

-- RLS Policies

-- Profiles:
-- 1. Users can view their own profile.
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Core Staff Details:
-- 1. View own details
create policy "Core staff can view own details"
  on core_staff_details for select
  using ( auth.uid() = id );

-- 2. HR Admin can view all
create policy "HR Admin can view all core details"
  on core_staff_details for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- 3. HR Admin can update all
create policy "HR Admin can update all core details"
  on core_staff_details for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- Support Staff Details:
-- 1. View own details (if applicable, though PRD says limited access)
create policy "Support staff can view own details"
  on support_staff_details for select
  using ( auth.uid() = id );

-- 2. HR Admin can manage all
create policy "HR Admin can manage all support details"
  on support_staff_details for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'core_staff');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
