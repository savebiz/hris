-- Create Storage Bucket for Confidential Docs
insert into storage.buckets (id, name, public)
values ('confidential-docs', 'confidential-docs', false)
on conflict (id) do nothing;

-- Enable RLS on objects (Usually enabled by default, commenting out to avoid permission issues)
-- alter table storage.objects enable row level security;

-- Policy: HR Admin can do everything
create policy "HR Admin has full access to confidential-docs"
on storage.objects for all
using (
  bucket_id = 'confidential-docs'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'hr_admin'
  )
)
with check (
  bucket_id = 'confidential-docs'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'hr_admin'
  )
);

-- Policy: Core/Support Staff can VIEW their own documents
-- Assumption: Files are stored in folders named after the user's ID: `user_id/filename`
create policy "Staff can view own documents"
on storage.objects for select
using (
  bucket_id = 'confidential-docs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Staff can UPLOAD to their own folder (e.g., signed contracts)
create policy "Staff can upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'confidential-docs'
  and (storage.foldername(name))[1] = auth.uid()::text
);
