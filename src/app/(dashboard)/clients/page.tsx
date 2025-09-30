'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Building2, Activity, Mail, Phone, Globe } from 'lucide-react'
import { ClientForm } from '@/components/clients/ClientForm'
import { DataTable, PaginationInfo } from '@/components/ui/data-table'
import { useToast } from '@/hooks/use-toast'
import type { Client } from '@prisma/client'

interface ClientStats {
    total: number
    active: number
    trial: number
    inactive: number
}

export default function ClientsPage() {
    const { toast } = useToast()
    const [clients, setClients] = useState<Client[]>([])
    const [stats, setStats] = useState<ClientStats>({ total: 0, active: 0, trial: 0, inactive: 0 })
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    })
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [showAddForm, setShowAddForm] = useState(false)

    const fetchClients = async (page: number = 1, limit: number = 20, search?: string) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('limit', limit.toString())
            if (search) params.append('search', search)
            if (statusFilter) params.append('status', statusFilter)

            const response = await fetch(`/api/clients/paginated?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch clients')
            }

            const data = await response.json()
            setClients(data.clients)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching clients:', error)
            toast({
                title: 'Error',
                description: 'Failed to load clients',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/clients/stats')
            if (!response.ok) {
                throw new Error('Failed to fetch stats')
            }

            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const handleRefresh = async () => {
        await Promise.all([
            fetchClients(pagination.page, pagination.limit),
            fetchStats()
        ])
    }

    const handlePageChange = (page: number) => {
        fetchClients(page, pagination.limit)
    }

    const handleLimitChange = (limit: number) => {
        fetchClients(1, limit)
    }

    const handleSearch = (search: string) => {
        fetchClients(1, pagination.limit, search)
    }

    useEffect(() => {
        handleRefresh()
    }, [statusFilter])

    // Table columns configuration
    const columns = [
        {
            key: 'businessName',
            label: 'Business Name',
            render: (client: Client) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium">{client.businessName}</div>
                        <div className="text-sm text-muted-foreground">{client.industry || 'No industry'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'businessEmail',
            label: 'Contact',
            render: (client: Client) => (
                <div className="space-y-1">
                    {client.businessEmail && (
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {client.businessEmail}
                        </div>
                    )}
                    {client.businessPhone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {client.businessPhone}
                        </div>
                    )}
                    {client.businessWebsite && (
                        <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <a href={client.businessWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Website
                            </a>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (client: Client) => (
                <Badge variant={
                    client.status === 'ACTIVE' ? 'default' :
                        client.status === 'TRIAL' ? 'secondary' : 'outline'
                }>
                    {client.status}
                </Badge>
            )
        },
        {
            key: 'subscriptionPlan',
            label: 'Plan',
            render: (client: Client) => (
                <span className="text-sm">{client.subscriptionPlan || 'No plan'}</span>
            )
        },
        {
            key: 'lastLoginAt',
            label: 'Last Login',
            render: (client: Client) => (
                <span className="text-sm text-muted-foreground">
                    {client.lastLoginAt
                        ? new Date(client.lastLoginAt).toLocaleDateString()
                        : 'Never'
                    }
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Created',
            render: (client: Client) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(client.createdAt).toLocaleDateString()}
                </span>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Client Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your client accounts and their marketing performance
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                    onClick={() => setShowAddForm(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Status Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === '' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('')}
                        >
                            All Clients
                        </Button>
                        <Button
                            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('ACTIVE')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={statusFilter === 'TRIAL' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('TRIAL')}
                        >
                            Trial
                        </Button>
                        <Button
                            variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter('INACTIVE')}
                        >
                            Inactive
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Data Table */}
            <DataTable
                data={clients}
                pagination={pagination}
                loading={loading}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearch}
                searchPlaceholder="Search clients by name, email, or industry..."
                columns={columns}
                emptyMessage="No clients found. Add your first client to get started."
            />

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Clients</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">Active Accounts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="text-2xl font-bold">{stats.trial}</p>
                                <p className="text-sm text-muted-foreground">Trial Accounts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-600" />
                            <div>
                                <p className="text-2xl font-bold">{stats.inactive}</p>
                                <p className="text-sm text-muted-foreground">Inactive</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ClientForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSuccess={handleRefresh}
            />
        </div>
    )
}