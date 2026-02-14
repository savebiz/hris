import { Metadata } from "next"
import { getCycles, getMyGoals } from "../../performance/actions"
import { CreateGoalForm } from "@/components/performance/forms"
import { GoalList } from "@/components/performance/goal-list"

export const metadata: Metadata = {
    title: "My Goals - DataGuard HRIS",
    description: "Manage performance goals",
}

export default async function EmployeePerformancePage() {
    const cycles = await getCycles() || []
    const activeCycle = cycles.find(c => c.status === 'active')

    // Only fetch goals if there is an active cycle? Or show history? 
    // For now, fetch all my goals.
    const goals = await getMyGoals() || []

    // Filter to active cycle for the main view
    const activeGoals = activeCycle ? goals.filter(g => g.cycle_id === activeCycle.id) : []
    const pastGoals = activeCycle ? goals.filter(g => g.cycle_id !== activeCycle.id) : goals

    return (
        <div className="max-w-4xl mx-auto flex-1 space-y-8 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Performance Goals</h2>
                {activeCycle ? (
                    <p className="text-muted-foreground">Current Cycle: <span className="font-semibold text-foreground">{activeCycle.title}</span></p>
                ) : (
                    <p className="text-muted-foreground">No active performance cycle.</p>
                )}
            </div>

            <div className="grid gap-8">
                {/* Active Goals Section */}
                {activeCycle && (
                    <div className="space-y-4">
                        <CreateGoalForm cycles={cycles} />
                        <GoalList goals={activeGoals} />
                    </div>
                )}

                {/* History Section */}
                {pastGoals.length > 0 && (
                    <div className="border-t pt-8">
                        <h3 className="text-xl font-semibold mb-4">Past Goals</h3>
                        <GoalList goals={pastGoals} />
                    </div>
                )}
            </div>
        </div>
    )
}
