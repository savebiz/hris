-- Create Onboarding Library (Global Tasks)
CREATE TABLE IF NOT EXISTS onboarding_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    link_url TEXT, -- Optional link to doc/video
    required_role user_role, -- Optional target role hint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create User Tasks (Assigned Instances)
CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    library_item_id UUID REFERENCES onboarding_library(id),
    custom_title TEXT, -- If ad-hoc task
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE onboarding_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: Library
CREATE POLICY "Admins can manage library"
ON onboarding_library
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'hr_admin'
    )
);

CREATE POLICY "Everyone can view library items"
ON onboarding_library
FOR SELECT
USING (true); -- Needed for assignment logic

-- Policies: User Tasks
CREATE POLICY "Admins can manage all user tasks"
ON user_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'hr_admin'
    )
);

CREATE POLICY "Users can view own tasks"
ON user_tasks
FOR SELECT
USING (
    auth.uid() = user_id
);

CREATE POLICY "Users can update own task status"
ON user_tasks
FOR UPDATE
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id ); 
-- Logic: User can toggle status. (Strictly we might want to limit columns but Supabase simple policy approach usually allows row update if check passes)
