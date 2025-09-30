'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

interface SecurityCardProps {
    user: {
        id: string
        name: string | null
        email: string
    }
}

export function SecurityCard({ user }: SecurityCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Two-Factor Auth</span>
                        <Badge variant="outline" className="bg-success-light text-success">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Last Login</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <Button className="w-full" variant="outline">
                        Security Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}