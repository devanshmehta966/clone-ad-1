'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Separator } from '@/components/ui/separator'
import { TrendingUp, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('Invalid credentials')) {
          setError('Invalid email or password. Please check your credentials.')
        } else if (result.error.includes('Too many login attempts')) {
          setError(result.error)
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        toast({
          title: 'Welcome back!',
          description: 'Signed in successfully',
        })
        // Use window.location to avoid redirect loops
        window.location.href = '/'
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push('/')
    }, 1000)
  }

  return (
    <div className="fixed inset-0 flex h-screen w-screen overflow-hidden">
      {/* Left Side - Branding */}
      <div className="relative hidden h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold">OmniChannel</h1>
            </div>
            <h2 className="mb-4 text-4xl font-bold leading-tight">
              Supercharge Your Marketing Performance
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-blue-100">
              Unify all your advertising campaigns across Google Ads, Meta,
              LinkedIn, and more. Get real-time insights and optimize your ROI
              like never before.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-blue-100">
                Real-time campaign analytics
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-blue-100">
                Cross-platform performance tracking
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-blue-100">
                Automated reporting & alerts
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-20 top-20 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-20 left-20 h-24 w-24 rounded-full bg-purple-300/20 blur-lg"></div>
        <div className="absolute right-10 top-1/2 h-16 w-16 rounded-full bg-blue-300/20 blur-md"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex h-full flex-1 items-center justify-center bg-gray-50 p-4 lg:p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">OmniChannel</h1>
          </div>

          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Welcome to OmniChannel
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to access your marketing dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 text-sm outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-12 text-sm outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer select-none text-sm text-gray-600"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="mt-6 h-12 w-full transform rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Signing you in...
                  </div>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-medium text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full rounded-lg border-2 border-gray-200 text-sm font-medium transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Security note */}
            <p className="mt-4 text-center text-xs text-gray-500">
              🔒 Your information is secure and encrypted with 256-bit SSL
            </p>
          </div>

          <div className="pb-2 pt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              href="/signup"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Sign up for free
            </Link>
          </div>

          {/* Footer links */}
          <div className="pb-4 pt-2 text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <Link
                href="/help"
                className="transition-colors hover:text-gray-700"
              >
                Need help?
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-gray-700"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-gray-700"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
