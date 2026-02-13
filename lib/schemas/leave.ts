import * as z from "zod"

export const leaveSchema = z.object({
    leave_type: z.enum(['Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid'], {
        required_error: "Please select a leave type.",
    }),
    start_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "A valid start date is required.",
    }),
    end_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "A valid end date is required.",
    }),
    reason: z.string().min(5, "Reason must be at least 5 characters."),
}).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
}, {
    message: "End date must be after start date",
    path: ["end_date"],
});

export type LeaveFormValues = z.infer<typeof leaveSchema>
