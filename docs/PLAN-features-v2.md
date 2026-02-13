# PLAN-features-v2: HRIS Enhancement Roadmap

> **Goal:** Implement critical compliance features (Audit, Privacy) and workflow enhancements (Manager Role) while laying ground for advanced modules.

## 🧠 Brainstorming Summary & Decisions

### 1. Manager Approval Workflow
*Problem:* Currently, leaves go directly to Admin. We need a "Line Manager" step.
*Selected Approach:* **"Status Gate" Pattern.**
- `leave_requests` table gets a `manager_id` column.
- Status flow: `pending_manager` -> `pending_hr` -> `approved` | `rejected`.
- **Pros:** Keeps single table (simpler queries), explicit state machine.

### 2. Audit Logs
*Problem:* Need to track "Who changed what" for NDPR.
*Selected Approach:* **Centralized `audit_logs` Table.**
- Columns: `actor_id`, `target_resource` (profile/leave), `action` (create/update/delete), `diff` (jsonb), `timestamp`.
- Implemented via: **Server Actions** (Application-level logging) for better context than DB triggers.

---

## 🤖 Orchestration: Agent Assignments

| Feature Area | Primary Agent | Supporting Agents |
|--------------|---------------|-------------------|
| **Workflow** | `backend-specialist` | `database-architect` (Schema), `frontend-specialist` (UI) |
| **Compliance** | `security-auditor` | `database-architect` (Audit Table), `frontend-specialist` (Notices) |
| **Mobile UX** | `frontend-specialist` | `mobile-design` (Layouts) |

---

## 📋 Task Breakdown

### Phase 7: Compliance & Core Tracking
#### [ ] Task 7.1: Implement Audit Log System
- **Agent:** `backend-specialist`
- **Steps:**
  1. Create `audit_logs` table (SQL).
  2. Create `logAction` helper function.
  3. Integrate logging into `updateProfile`, `approveLeave`, `deleteDocument`.
  4. Create Admin Audit View page.

#### [ ] Task 7.2: Privacy & Terms Pages
- **Agent:** `frontend-specialist`
- **Steps:**
  1. Create `app/(public)/privacy/page.tsx` with provided text.
  2. Create `app/(public)/terms/page.tsx`.
  3. Link in Footer.

### Phase 8: Manager Workflow & Profile Correction
#### [ ] Task 8.1: Manager Role & Schema Update
- **Agent:** `database-architect`
- **Steps:**
  1. Update `enums` to include `status_manager_pending`.
  2. Add `manager_id` to `profiles`.
  3. Update `leave_requests` RLS.

#### [ ] Task 8.2: Manager Dashboard
- **Agent:** `frontend-specialist`
- **Steps:**
  1. Create `/manager/dashboard`.
  2. Implement "My Team" view.
  3. Implement "Approve (Forward to HR)" action.

#### [ ] Task 8.3: Profile Correction Workflow
- **Agent:** `frontend-specialist`
- **Steps:**
  1. Create `profile_change_requests` table.
  2. Add "Request Correction" button to Employee Profile.
  3. Create Admin View to approve/reject changes.

### Phase 9: Mobile & UI Polish
#### [ ] Task 9.1: Mobile Responsive Audit
- **Agent:** `frontend-specialist`
- **Steps:**
  1. Verify Table scrolling on mobile.
  2. Adjust Sidebar/Nav for touch targets.
  3. Optimize "Request Leave" form for mobile.

---

## ✅ Verification Plan
- [ ] **Audit Trail:** Perform action -> Check DB for log entry.
- [ ] **Manager Flow:** Staff Request -> Manager Approve -> HR Approve.
