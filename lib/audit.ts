import { createClient } from "@/lib/supabase/server"

interface LogActionParams {
    action: string
    resourceType: string
    resourceId?: string
    details?: Record<string, any>
    actorId?: string // Optional, if not provided we try to get current user
}

export async function logAction({
    action,
    resourceType,
    resourceId,
    details,
    actorId
}: LogActionParams) {
    try {
        const supabase = await createClient()

        // If actorId is not provided, try to get from session
        let finalActorId = actorId
        if (!finalActorId) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                finalActorId = user.id
            } else {
                console.warn("[Audit] No actor found for action:", action)
                return
            }
        }

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                actor_id: finalActorId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                details
            })

        if (error) {
            console.error("[Audit] Failed to insert log:", error)
        }
    } catch (err) {
        console.error("[Audit] Unexpected error:", err)
    }
}
