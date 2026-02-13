create table if not exists public.profile_change_requests (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    data jsonb not null, -- The proposed changes
    status text not null default 'pending', -- pending, approved, rejected
    admin_comment text,
    created_at timestamptz not null default now(),
    constraint profile_change_requests_pkey primary key (id)
);

alter table public.profile_change_requests enable row level security;

create policy "Users can create requests"
    on public.profile_change_requests
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can view own requests"
    on public.profile_change_requests
    for select
    to authenticated
    using (user_id = auth.uid());

create policy "Admins can view all requests"
    on public.profile_change_requests
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'hr_admin'
        )
    );

create policy "Admins can update requests"
    on public.profile_change_requests
    for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'hr_admin'
        )
    );
