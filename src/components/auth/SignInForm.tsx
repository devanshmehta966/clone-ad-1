'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2 } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface SignInFormProps {
    callbackUrl?: string
}

export function SignInForm({ callbackUrl = '/' }: SignInFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        console.log('Attempting signin with:', { email, password: '***' })

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            console.log('SignIn result:', result)

            if (result?.error) {
                console.error('SignIn error:', result.error)
                if (result.error.includes('Invalid credentials')) {
                    setError('Invalid email or password. Please check your credentials.')
                } else if (result.error.includes('Too many login attempts')) {
                    setError(result.error)
                } else {
                    setError(result.error)
                }
            } else if (result?.ok) {
                console.log('SignIn successful, redirecting to:', callbackUrl)
                toast({
                    title: 'Welcome back!',
                    description: 'Signed in successfully',
                })
                // Use window.location instead of router to avoid redirect loops
                window.location.href = callbackUrl
            }
        } catch (error) {
            console.error('SignIn exception:', error)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
            </Button>
        </form>
    )
}