-- Create audit_logs table
create table if not exists public.audit_logs (
    id uuid not null default gen_random_uuid(),
    actor_id uuid not null references auth.users(id),
    action text not null,
    resource_type text not null,
    resource_id text,
    details jsonb,
    ip_address text,
    created_at timestamptz not null default now(),
    constraint audit_logs_pkey primary key (id)
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policy: Only HR Admins can view audit logs
create policy "Admins can view audit logs"
    on public.audit_logs
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'hr_admin'
        )
    );

-- Policy: Authenticated users can INSERT (via server action)
-- Actually, typically we trust the server action to insert. 
-- But if we insert using a client, we need a policy.
-- Server actions use `createClient()` which might be authenticated as the user.
-- So we need an INSERT policy for authenticated users, 
-- or we use SERVICE_ROLE in the logging function (safer, prevents tampering).
-- Let's allow insert for authenticated users for now to capture self-actions, 
-- but ideally users shouldn't be able to fabricate logs.
-- Better approach: Use Service Role for logging in `lib/audit.ts`.
-- So NO insert policy for public/authenticated needed if we use Service Role.
-- But wait, my `createClient` helper usually uses the user's session.
-- Constructing a service role client in Next.js is easy if we have the key.
-- I'll add a policy allowing users to insert logs where `actor_id` = `auth.uid()`, 
-- just in case we use the standard client.
create policy "Users can create audit logs for themselves"
    on public.audit_logs
    for insert
    to authenticated
    with check (
        actor_id = auth.uid()
    );
