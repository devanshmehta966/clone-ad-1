'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { Client } from '@prisma/client'

interface ClientFormProps {
    client?: Client
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function ClientForm({ client, open, onOpenChange, onSuccess }: ClientFormProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        businessName: client?.businessName || '',
        businessEmail: client?.businessEmail || '',
        businessPhone: client?.businessPhone || '',
        businessWebsite: client?.businessWebsite || '',
        industry: client?.industry || '',
        status: client?.status || 'ACTIVE',
        subscriptionPlan: client?.subscriptionPlan || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = client ? `/api/clients/${client.id}` : '/api/clients'
            const method = client ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save client')
            }

            toast({
                title: 'Success',
                description: `Client ${client ? 'updated' : 'created'} successfully`,
            })

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving client:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save client',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{client ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                    <DialogDescription>
                        {client ? 'Update client information' : 'Create a new client account'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                                id="businessName"
                                value={formData.businessName}
                                onChange={(e) => handleInputChange('businessName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessEmail">Business Email</Label>
                            <Input
                                id="businessEmail"
                                type="email"
                                value={formData.businessEmail}
                                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessPhone">Business Phone</Label>
                            <Input
                                id="businessPhone"
                                value={formData.businessPhone}
                                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessWebsite">Business Website</Label>
                            <Input
                                id="businessWebsite"
                                type="url"
                                value={formData.businessWebsite}
                                onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                                placeholder="https://"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                                id="industry"
                                value={formData.industry}
                                onChange={(e) => handleInputChange('industry', e.target.value)}
                            />
                        </div>
                        {client && (
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="TRIAL">Trial</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                            <Input
                                id="subscriptionPlan"
                                value={formData.subscriptionPlan}
                                onChange={(e) => handleInputChange('subscriptionPlan', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}