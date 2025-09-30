'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoader() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => setLoading(false), 100)
        return () => clearTimeout(timer)
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '30%' }}></div>
        </div>
    )
}