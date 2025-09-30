import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import { SignInForm } from '@/components/auth/SignInForm'
import { renderWithProviders } from '../../../utils/test-helpers'

// Mock next-auth
jest.mock('next-auth/react')

describe('SignInForm', () => {
    const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders signin form correctly', () => {
        renderWithProviders(<SignInForm />)

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('displays OAuth provider buttons', () => {
        renderWithProviders(<SignInForm />)

        expect(screen.getByTestId('google-signin')).toBeInTheDocument()
        expect(screen.getByTestId('facebook-signin')).toBeInTheDocument()
        expect(screen.getByTestId('linkedin-signin')).toBeInTheDocument()
    })

    it('handles form submission with valid credentials', async () => {
        const user = userEvent.setup()
        mockSignIn.mockResolvedValue({ ok: true, error: null } as any)

        renderWithProviders(<SignInForm />)

        // Fill form
        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        // Submit form
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                redirect: false,
            })
        })
    })

    it('displays validation errors for empty fields', async () => {
        const user = userEvent.setup()

        renderWithProviders(<SignInForm />)

        // Try to submit empty form
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument()
            expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        })
    })

    it('displays validation error for invalid email', async () => {
        const user = userEvent.setup()

        renderWithProviders(<SignInForm />)

        // Fill invalid email
        await user.type(screen.getByLabelText(/email/i), 'invalid-email')
        await user.type(screen.getByLabelText(/password/i), 'password123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
        })
    })

    it('displays error message for failed authentication', async () => {
        const user = userEvent.setup()
        mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' } as any)

        renderWithProviders(<SignInForm />)

        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
        })
    })

    it('shows loading state during submission', async () => {
        const user = userEvent.setup()
        mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true } as any), 1000)))

        renderWithProviders(<SignInForm />)

        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))

        // Check loading state
        expect(screen.getByTestId('signin-loading')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    })

    it('handles OAuth provider signin', async () => {
        const user = userEvent.setup()
        mockSignIn.mockResolvedValue({ ok: true } as any)

        renderWithProviders(<SignInForm />)

        await user.click(screen.getByTestId('google-signin'))

        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' })
    })

    it('toggles password visibility', async () => {
        const user = userEvent.setup()

        renderWithProviders(<SignInForm />)

        const passwordInput = screen.getByLabelText(/password/i)
        const toggleButton = screen.getByTestId('toggle-password-visibility')

        // Initially password should be hidden
        expect(passwordInput).toHaveAttribute('type', 'password')

        // Click toggle to show password
        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        // Click toggle to hide password again
        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('has proper accessibility attributes', () => {
        renderWithProviders(<SignInForm />)

        const form = screen.getByRole('form')
        expect(form).toHaveAttribute('aria-label', 'Sign in form')

        const emailInput = screen.getByLabelText(/email/i)
        expect(emailInput).toHaveAttribute('aria-required', 'true')

        const passwordInput = screen.getByLabelText(/password/i)
        expect(passwordInput).toHaveAttribute('aria-required', 'true')
    })

    it('prevents multiple submissions', async () => {
        const user = userEvent.setup()
        mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true } as any), 1000)))

        renderWithProviders(<SignInForm />)

        await user.type(screen.getByLabelText(/email/i), 'test@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /sign in/i })

        // Click submit multiple times
        await user.click(submitButton)
        await user.click(submitButton)
        await user.click(submitButton)

        // Should only be called once
        expect(mockSignIn).toHaveBeenCalledTimes(1)
    })
})