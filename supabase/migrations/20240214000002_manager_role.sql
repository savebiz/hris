-- Add manager_id to profiles (Self-referencing Foreign Key)
alter table public.profiles
add column if not exists manager_id uuid references public.profiles(id);

-- Update leave_status enum
-- Supabase/Postgres doesn't support "IF NOT EXISTS" for enum values easily in standard SQL blocks without function wrappers, 
-- but we can try to add it. If it fails (already exists), it fails safely usually in idempotent scripts if handled, 
-- but here we assume it doesn't exist.
alter type public.leave_status add value if not exists 'pending_manager' before 'pending';
-- Note: 'pending' was likely the default. We might want 'pending_manager' -> 'pending_hr' (or just 'pending').
-- Let's rename 'pending' to 'pending_hr' ideally, but that's a breaking change.
-- Let's stick to: pending_manager -> pending (which implies HR) -> approved.

-- Update leave_requests table
alter table public.leave_requests
add column if not exists manager_comment text,
add column if not exists manager_approval_date timestamptz;

-- RLS: Allow Managers to view leave requests of their direct reports
create policy "Managers can view team leaves"
    on public.leave_requests
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = leave_requests.user_id
            and profiles.manager_id = auth.uid()
        )
    );

-- RLS: Allow Managers to update leave requests of their direct reports
create policy "Managers can update team leaves"
    on public.leave_requests
    for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = leave_requests.user_id
            and profiles.manager_id = auth.uid()
        )
    );
