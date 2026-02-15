import * as z from "zod"

export const createStaffSchema = z.object({
    // Common Fields
    email: z.string().email({ message: "Invalid email address" }),
    full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    phone_number: z.string().min(10, "Phone number is required"),
    residential_address: z.string().min(5, "Address is required"),
    staff_category: z.enum(["core", "support"]),

    // Core Staff Fields
    role: z.enum(["hr_admin", "line_manager", "core_staff"]).optional(), // Support is implied if category is support
    job_title: z.string().optional(),
    department: z.string().optional(),
    staff_id: z.string().optional(),
    date_of_employment: z.string().optional(),

    // Support Staff Fields
    project_assignment: z.string().optional(),
    project_location: z.string().optional(),
    deployment_start_date: z.string().optional(),
    supervisor_name: z.string().optional(),
}).refine((data) => {
    if (data.staff_category === 'core') {
        return !!data.role && !!data.job_title && !!data.department && !!data.staff_id && !!data.date_of_employment
    }
    if (data.staff_category === 'support') {
        return !!data.project_assignment && !!data.project_location && !!data.deployment_start_date && !!data.supervisor_name
    }
    return true
}, {
    message: "Please fill in all required fields for the selected staff category",
    path: ["staff_category"], // Error will attach here broadly or we can get specific
})

export type CreateStaffValues = z.infer<typeof createStaffSchema>
