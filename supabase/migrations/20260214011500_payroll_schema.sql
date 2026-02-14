-- Create Payroll Records Table
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    net_salary DECIMAL(12, 2),
    file_path TEXT NOT NULL, -- Path in storage bucket
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all payroll records"
ON payroll_records
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'hr_admin'
    )
);

CREATE POLICY "Users can view own payroll records"
ON payroll_records
FOR SELECT
USING (
    auth.uid() = user_id
);

-- Storage Bucket Setup (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'payslips' bucket
CREATE POLICY "Admins can upload payslips"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'payslips' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'hr_admin'
    )
);

CREATE POLICY "Admins can view all payslips"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'payslips' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'hr_admin'
    )
);

CREATE POLICY "Users can view own payslips"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'payslips' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
