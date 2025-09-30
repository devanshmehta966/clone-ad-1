'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'
import { UpdateProfileSchema, UpdateProfileData } from '@/lib/validation/auth.schemas'
import { useToast } from '@/hooks/use-toast'

interface ProfileFormProps {
    user: {
        id: string
        name: string | null
        email: string
        profile: {
            fullName: string | null
            businessName: string | null
            businessEmail: string | null
            businessPhone: string | null
            businessWebsite: string | null
        } | null
    }
    onUpdate: () => void
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<UpdateProfileData>({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: {
            name: user.profile?.fullName || user.name || '',
            businessName: user.profile?.businessName || '',
            businessEmail: user.profile?.businessEmail || '',
            businessPhone: user.profile?.businessPhone || '',
            businessWebsite: user.profile?.businessWebsite || ''
        }
    })

    const onSubmit = async (data: UpdateProfileData) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            toast({
                title: 'Profile updated',
                description: 'Your profile has been updated successfully.'
            })

            onUpdate()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Information
                </CardTitle>
                <CardDescription>
                    Update your account details and preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                            <Input
                                id="firstName"
                                defaultValue="Sarah"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                            <Input
                                id="lastName"
                                defaultValue="Johnson"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            defaultValue="sarah@acmecorp.com"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                        <Input
                            id="company"
                            defaultValue="Acme Corp"
                            className="mt-1"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}