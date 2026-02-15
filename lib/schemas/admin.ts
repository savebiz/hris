import * as z from "zod"

export const createStaffSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    role: z.enum(["hr_admin", "line_manager", "core_staff", "support_staff"]),
    department: z.string().optional(),
    job_title: z.string().optional(),
})

export type CreateStaffValues = z.infer<typeof createStaffSchema>
