'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { submitProfileRequest } from "@/app/(protected)/employee/actions"
import { Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfileCorrectionDialog({ profile }: { profile: any }) {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form state
    const [phone, setPhone] = useState(profile?.phone_number || '')
    const [address, setAddress] = useState(profile?.residential_address || '')
    const [fullName, setFullName] = useState(profile?.full_name || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Only send changed fields to keep payload clean?
        // For simplicity, send relevant editable fields.
        // We exclude email/role as those are strictly controlled.
        const changes: Record<string, any> = {}
        if (phone !== profile?.phone_number) changes.phone_number = phone
        if (address !== profile?.residential_address) changes.residential_address = address
        if (fullName !== profile?.full_name) changes.full_name = fullName

        if (Object.keys(changes).length === 0) {
            setLoading(false)
            setOpen(false)
            return
        }

        const result = await submitProfileRequest(changes)

        setLoading(false)
        if (result.success) {
            setOpen(false)
            toast({
                title: "Request Submitted",
                description: "Your profile update request has been sent to HR.",
                className: "bg-green-600 text-white border-none",
            })
        } else {
            toast({
                title: "Submission Failed",
                description: result.error || "Could not submit request. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Pencil className="mr-2 h-4 w-4" />
                    Request Correction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save to submit for HR approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="name" className="text-left sm:text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="phone" className="text-left sm:text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="address" className="text-left sm:text-right">
                                Address
                            </Label>
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Request"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
