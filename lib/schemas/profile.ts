import * as z from "zod"

export const profileSchema = z.object({
    // Shared Fields
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email(),
    phone_number: z.string().min(10, "Phone number is required"),
    residential_address: z.string().min(5, "Address is required"),
    emergency_contact: z.string().optional(),

    // Role Selector
    staff_type: z.enum(["core", "support"]),

    // Core Staff Specific
    job_title: z.string().optional(),
    department: z.string().optional(),
    unit: z.string().optional(),
    staff_id: z.string().optional(),
    date_of_employment: z.string().optional(), // Date string YYYY-MM-DD
    line_manager_id: z.string().uuid().optional(),

    // Support Staff Specific
    project_assignment: z.string().optional(),
    project_location: z.string().optional(),
    supervisor_name: z.string().optional(),
    deployment_start_date: z.string().optional(),

}).refine((data) => {
    if (data.staff_type === "core") {
        return !!data.job_title && !!data.department && !!data.staff_id && !!data.date_of_employment
    }
    if (data.staff_type === "support") {
        return !!data.project_assignment && !!data.project_location && !!data.deployment_start_date
    }
    return true
}, {
    message: "Missing required fields for selected staff type",
    path: ["staff_type"],
})

export type ProfileFormValues = z.infer<typeof profileSchema>
