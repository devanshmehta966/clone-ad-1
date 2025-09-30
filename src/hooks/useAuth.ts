'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = useCallback(async (provider?: string, options?: any) => {
    const result = await signIn(provider, options)
    return result
  }, [])

  const logout = useCallback(async (callbackUrl?: string) => {
    await signOut({ callbackUrl: callbackUrl || '/' })
  }, [])

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    status,
  }
}