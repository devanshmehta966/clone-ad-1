'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Building2, MoreHorizontal, Activity, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ClientForm } from './ClientForm'
import type { Client } from '@prisma/client'

interface ClientCardProps {
    client: Client
    onUpdate: () => void
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
    const { toast } = useToast()
    const [showEditForm, setShowEditForm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 hover:bg-green-200'
            case 'TRIAL':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
    }

    const formatLastLogin = (lastLogin: Date | null) => {
        if (!lastLogin) return 'Never'

        const now = new Date()
        const diff = now.getTime() - new Date(lastLogin).getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
        return new Date(lastLogin).toLocaleDateString()
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        try {
            const response = await fetch(`/api/clients/${client.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete client')
            }

            toast({
                title: 'Success',
                description: 'Client deleted successfully',
            })

            onUpdate()
        } catch (error) {
            console.error('Error deleting client:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to delete client',
                variant: 'destructive',
            })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <Card className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{client.businessName}</CardTitle>
                                <CardDescription>{client.industry || 'No industry specified'}</CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge className={getStatusColor(client.status)}>
                                {client.status.toLowerCase()}
                            </Badge>
                        </div>

                        {/* Contact Information */}
                        {client.businessEmail && (
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium truncate">{client.businessEmail}</p>
                                </div>
                            </div>
                        )}

                        {client.businessPhone && (
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="font-medium">{client.businessPhone}</p>
                                </div>
                            </div>
                        )}

                        {client.businessWebsite && (
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Website</p>
                                    <p className="font-medium truncate">
                                        <a
                                            href={client.businessWebsite}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {client.businessWebsite}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Subscription Plan */}
                        {client.subscriptionPlan && (
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Plan</p>
                                    <p className="font-medium">{client.subscriptionPlan}</p>
                                </div>
                            </div>
                        )}

                        {/* Last Login */}
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                                <p className="text-muted-foreground">Last Login</p>
                                <p className="font-medium">{formatLastLogin(client.lastLoginAt)}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                                View Dashboard
                            </Button>
                            <Button size="sm" variant="outline">
                                <Activity className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ClientForm
                client={client}
                open={showEditForm}
                onOpenChange={setShowEditForm}
                onSuccess={onUpdate}
            />
        </>
    )
}