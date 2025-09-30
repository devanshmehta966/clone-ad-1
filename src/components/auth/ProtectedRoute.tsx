'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
    requiredRole?: 'ADMIN' | 'CLIENT'
    fallback?: ReactNode
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallback = <div>Loading...</div>
}: ProtectedRouteProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return // Still loading

        if (!session) {
            router.push('/auth/signin')
            return
        }

        if (requiredRole && session.user.role !== requiredRole) {
            router.push('/unauthorized')
            return
        }
    }, [session, status, router, requiredRole])

    if (status === 'loading') {
        return <>{fallback}</>
    }

    if (!session) {
        return null
    }

    if (requiredRole && session.user.role !== requiredRole) {
        return null
    }

    return <>{children}</>
}