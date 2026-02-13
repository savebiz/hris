import os
import json

def get_status():
    print("=== Project Status ===\n")
    
    root_dir = os.getcwd()
    # Check if we are in root or need to look into hris-portal
    if os.path.exists("hris-portal/package.json"):
         project_path = os.path.join(root_dir, "hris-portal")
         print(f"Project: hris-portal (Subdirectory)")
    elif os.path.exists("package.json"):
         project_path = root_dir
         print(f"Project: {os.path.basename(root_dir)}")
    else:
         project_path = root_dir
         print(f"Project: {os.path.basename(root_dir)}")
         
    print(f"Path: {project_path}")
    
    # Check for Next.js in the identified path
    pkg_path = os.path.join(project_path, "package.json")
    if os.path.exists(pkg_path):
        with open(pkg_path) as f:
            try:
                pkg = json.load(f)
                print(f"Type: {pkg.get('name', 'unknown')}")
                print(f"Status: active")
                print("\nTech Stack:")
                deps = pkg.get('dependencies', {})
                if 'next' in deps: print("   Framework: next.js")
                if 'react' in deps: print("   UI: react")
                if 'tailwindcss' in deps: print("   Styling: tailwindcss")
                if '@supabase/supabase-js' in deps: print("   Database: supabase")
            except:
                print("Status: invalid package.json")
    else:
        print("Type: unknown")
        print("Status: initializing")

    print("\nFeatures:")
    if os.path.exists("supabase/migrations/20240213000000_init_schema.sql"):
        print("   - [x] Supabase Schema")
    if os.path.exists("middleware.ts"):
        print("   - [x] Auth & RBAC Middleware")
    if os.path.exists("app/(auth)/login/page.tsx"):
        print("   - [x] Login System")
    if os.path.exists("components/forms/profile/profile-form.tsx"):
        print("   - [x] Profile Management (Core & Support)")
    if os.path.exists("components/documents/document-upload.tsx"):
        print("   - [x] Document Repository")
    if os.path.exists("components/leaves/leave-history.tsx"):
        print("   - [x] Leave Management System")

    print("\nPending (Phase 4):")
    print("   - [ ] Push to GitHub (Initialized)")
    print("   - [ ] Deployment to Vercel (Optional)")

    print("\n=== Agent Status ===")
    print("frontend-specialist -> Completed Phase 3 Features")
    print("backend-specialist -> Completed Migrations & Actions")
    print("deployment-procedures -> Git Initialized, Ready to Push")

if __name__ == "__main__":
    get_status()
