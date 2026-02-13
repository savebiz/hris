-- Create Leave Requests Table
create table leave_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  leave_type text not null, -- 'Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid'
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status not null default 'pending', -- Enum created in init_schema
  manager_comment text,
  approved_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table leave_requests enable row level security;

-- Policies

-- 1. Users can view their own leave requests
create policy "Users can view own leaves"
  on leave_requests for select
  using ( auth.uid() = user_id );

-- 2. Users can create their own leave requests
create policy "Users can create own leaves"
  on leave_requests for insert
  with check ( auth.uid() = user_id );

-- 3. HR Admins and Line Managers can view requests assigned to them or all (for HR)
-- Simplified for Phase 1: HR Admin sees all. Line Manager logic requires recursive query on `core_staff_details` which is complex for RLS. 
-- We will allow HR Admin to see ALL.
create policy "HR Admin can view all leaves"
  on leave_requests for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- 4. HR Admin can update (approve/decline)
create policy "HR Admin can update leaves"
  on leave_requests for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'hr_admin'
    )
  );

-- Indicies for performance
create index leave_requests_user_id_idx on leave_requests(user_id);
create index leave_requests_status_idx on leave_requests(status);
