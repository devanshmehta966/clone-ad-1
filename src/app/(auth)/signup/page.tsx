'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    // Check password strength
    if (field === 'password') {
      const strength = calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!agreedToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          // Optionally include company if your API accepts it
          company: formData.company,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        toast({
          title: 'Account created successfully!',
          description: 'Please sign in to your account.',
        })
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          password: '',
          confirmPassword: '',
        })
        setAgreedToTerms(false)
        setPasswordStrength(0)
        setErrors({})
        // Stay on page like SignUpForm; user can navigate to sign in
      } else {
        // Handle known backend error shapes and status codes
        const msg: string | undefined = data?.error || data?.message
        const lowerMsg = typeof msg === 'string' ? msg.toLowerCase() : ''

        if (
          response.status === 409 ||
          data?.code === 'USER_EXISTS' ||
          lowerMsg.includes('user already exists') ||
          lowerMsg.includes('email already exists') ||
          lowerMsg.includes('already registered')
        ) {
          setErrors((prev) => ({
            ...prev,
            email: 'You are already signed up. Try signing in instead.',
          }))
        } else if (
          data?.code === 'RATE_LIMIT_EXCEEDED' ||
          response.status === 429
        ) {
          setErrors((prev) => ({
            ...prev,
            email: msg || 'Too many attempts. Please try again later.',
          }))
        } else if (msg) {
          setErrors((prev) => ({ ...prev, email: msg }))
        } else {
          setErrors((prev) => ({
            ...prev,
            email: 'An error occurred during registration',
          }))
        }
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: 'An unexpected error occurred. Please try again.',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
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
              Start Your Marketing Journey
            </h2>
            <p className="mb-8 text-xl leading-relaxed text-blue-100">
              Join thousands of marketers who trust OmniChannel to optimize
              their campaigns and maximize ROI across all advertising platforms.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-blue-100">Unified campaign management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Eye className="h-4 w-4" />
              </div>
              <span className="text-blue-100">
                Advanced analytics & insights
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-blue-100">
                Smart alerts & recommendations
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-20 top-20 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-20 left-20 h-24 w-24 rounded-full bg-purple-300/20 blur-lg"></div>
        <div className="absolute right-10 top-1/2 h-16 w-16 rounded-full bg-blue-300/20 blur-md"></div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex h-full flex-1 items-start justify-center overflow-y-auto bg-gray-50 p-2 lg:p-4">
        <div className="my-2 w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-1 flex items-center justify-center gap-1 lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-bold text-gray-900">OmniChannel</h1>
          </div>

          <div className="mb-1 text-center">
            <h1 className="mb-1 text-lg font-bold text-gray-900">
              Create your account
            </h1>
            <p className="text-xs text-gray-600">
              Join thousands of marketers • Start your free trial today
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="firstName"
                    className="text-xs font-medium text-gray-700"
                  >
                    First Name <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      className={`h-9 border pl-8 text-sm ${errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                    />
                    {formData.firstName && !errors.firstName && (
                      <CheckCircle className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-2 w-2" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="lastName"
                    className="text-xs font-medium text-gray-700"
                  >
                    Last Name <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      className={`h-9 border pl-8 text-sm ${errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                    />
                    {formData.lastName && !errors.lastName && (
                      <CheckCircle className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-2 w-2" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700"
                >
                  Work Email Address <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-9 border pl-8 text-sm ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                  />
                  {formData.email &&
                    !errors.email &&
                    /\S+@\S+\.\S+/.test(formData.email) && (
                      <CheckCircle className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-green-500" />
                    )}
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-2 w-2" />
                    {errors.email ===
                    'You are already signed up. Try signing in instead.' ? (
                      <>
                        You are already signed up. Try{' '}
                        <Link
                          href="/signin"
                          className="underline underline-offset-2 hover:text-red-700"
                        >
                          signing in
                        </Link>{' '}
                        instead.
                      </>
                    ) : (
                      errors.email
                    )}
                  </p>
                )}
              </div>

              {/* Company field */}
              <div className="space-y-1">
                <Label
                  htmlFor="company"
                  className="text-xs font-medium text-gray-700"
                >
                  Company Name <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Building className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange('company', e.target.value)
                    }
                    className={`h-9 border pl-8 text-sm ${errors.company ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:ring-0`}
                  />
                  {formData.company && !errors.company && (
                    <CheckCircle className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-green-500" />
                  )}
                </div>
                {errors.company && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-2 w-2" />
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Password fields - Split into separate section */}
              <div className="space-y-1 pt-1">
                <div className="border-t border-gray-100 pt-1">
                  <h3 className="mb-1 text-xs font-semibold text-gray-800">
                    Create Your Password
                  </h3>

                  {/* Password field */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-xs font-medium text-gray-700"
                    >
                      Password <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8+ characters"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        className={`h-9 border pl-8 pr-10 text-sm ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="h-1 flex-1 rounded-full bg-gray-200">
                            <div
                              className={`h-1 rounded-full transition-all duration-300 ${
                                passwordStrength < 50
                                  ? 'bg-red-500'
                                  : passwordStrength < 75
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength < 50
                                ? 'text-red-600'
                                : passwordStrength < 75
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {passwordStrength < 50
                              ? 'Weak'
                              : passwordStrength < 75
                                ? 'Good'
                                : 'Strong'}
                          </span>
                        </div>
                      </div>
                    )}
                    {errors.password && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-2 w-2" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password field */}
                  <div className="mt-1 space-y-1">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-medium text-gray-700"
                    >
                      Confirm Password <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange('confirmPassword', e.target.value)
                        }
                        className={`h-9 border pl-8 pr-10 text-sm ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} rounded-md bg-gray-50 outline-none ring-0 transition-all duration-200 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      {formData.confirmPassword &&
                        formData.password === formData.confirmPassword && (
                          <CheckCircle className="absolute right-8 top-1/2 h-3 w-3 -translate-y-1/2 text-green-500" />
                        )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-2 w-2" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="space-y-1 pt-1">
                <div className="flex items-start space-x-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={`h-3 w-3 border bg-white text-blue-600 ${errors.terms ? 'border-red-300' : 'border-gray-300'} mt-0.5 rounded focus:ring-1 focus:ring-blue-500`}
                  />
                  <Label
                    htmlFor="terms"
                    className="cursor-pointer select-none text-xs leading-tight text-gray-600"
                  >
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="ml-4 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-2 w-2" />
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="mt-2 h-10 w-full transform rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.99]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Creating your account...
                  </div>
                ) : (
                  'Create Account & Start Free Trial'
                )}
              </Button>

              {/* Security note */}
              <p className="mt-1 text-center text-xs text-gray-500">
                🔒 Your information is secure and encrypted
              </p>
            </form>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 font-medium text-gray-500">
                  or sign up with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-9 w-full rounded-md border border-gray-200 text-sm font-medium transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-3 w-3" viewBox="0 0 24 24">
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
              Continue with Google
            </Button>

            {/* Additional signup benefits */}
            <div className="mt-1 border-t border-gray-100 pt-1">
              <div className="space-y-1 text-center">
                <p className="text-xs text-gray-500">
                  🚀 Join 10,000+ marketers using OmniChannel
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <span>• 14-day free trial</span>
                  <span>• No setup fees</span>
                  <span>• Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-1 pt-1 text-center text-xs">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/signin"
              className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </div>

          {/* Footer links */}
          <div className="pb-1 pt-1 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
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
                Privacy
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-gray-700"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
