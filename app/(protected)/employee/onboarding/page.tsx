import { Metadata } from "next"
import { getUserTasks } from "../../onboarding/actions"
import { EmployeeTaskList } from "@/components/onboarding/task-list"

export const metadata: Metadata = {
    title: "My Onboarding - DataGuard HRIS",
    description: "Complete your onboarding tasks",
}

export default async function OnboardingPage() {
    const tasks = await getUserTasks()

    return (
        <div className="max-w-3xl mx-auto flex-1 space-y-8 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Onboarding</h2>
                <p className="text-muted-foreground">Complete these steps to get started.</p>
            </div>

            <EmployeeTaskList tasks={tasks || []} />
        </div>
    )
}
