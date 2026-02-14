# PLAN-features-v3: Advanced Modules

> **Goal:** Expand HRIS with "Life Cycle" management features: Onboarding, Paying, and Performing.

## 🚀 Proposed Features (Phase 3)

### 1. 💰 Payroll Portal (High Priority)
*Problem:* Employees email HR for payslips; no historical record accessible to them.
*Solution:* secure Payslip Repository.
- **Admin**: Upload PDF payslips (bulk or single) tagged by Month/Year.
- **Employee**: View "My Payslips" table with download links.
- **Security**: Strictly scoped RLS (User can ONLY see own payslips).

### 2. 🚀 Onboarding Workflows
*Problem:* New hires don't know what to do on Day 1.
*Solution:* Digital Checklist.
- **Admin**: Define templates (e.g., "Standard Onboarding").
- **Employee**: See "Onboarding Tasks" (e.g., "Upload ID", "Read Handbook").
- **Manager**: Track completion status of new team members.

### 3. 🎯 Performance Management
*Problem:* Goals are tracked in spreadsheets/emails.
*Solution:* Structured Goal Tracking.
- **Employee**: Create "Quarterly Goals".
- **Manager**: Approve goals and provide "End of Quarter Rating".
- **HR**: View company-wide performance distribution.

---

## 📋 Task Breakdown

### Module A: Payroll (Estimated: 2-3 hours)
#### [ ] Task A.1: Payroll Schema & Storage
- Create `payroll_records` table (`user_id`, `month`, `year`, `file_path`, `net_salary`).
- Create `payslips` storage bucket with strict RLS.

#### [ ] Task A.2: Admin Payroll Tools
- UI to upload payslip (Single file upload linked to user).
- (Optional) Bulk upload utility (Zip file processing? Or just single for MVP).

#### [ ] Task A.3: Employee Payroll View
- "My Payslips" Page.
- Secure Download links.

### Module B: Onboarding (Estimated: 3-4 hours)
#### [ ] Task B.1: Task Schema
- `onboarding_tasks` table (`title`, `description`, `required_role`).
- `user_tasks` table (`user_id`, `task_id`, `status`, `completed_at`).

#### [ ] Task B.2: Onboarding UI
- Admin: "Assign Onboarding" action.
- Employee: Dashboard widget "Pending Tasks".

---

## 🤖 Orchestration

| Module | Primary Agent | Supporting Agents |
|--------|---------------|-------------------|
| **Payroll** | `backend-specialist` | `database-architect` (RLS), `frontend-specialist` (Upload UI) |
| **Onboarding** | `frontend-specialist` | `database-architect` (Schema) |

---

## ✅ Verification
- [ ] **Payroll:** Upload a PDF as Admin -> Log in as that User -> Download it -> Log in as other User -> Ensure access denied.
- [ ] **Onboarding:** Assign task -> User checks it off -> Manager sees progress.
