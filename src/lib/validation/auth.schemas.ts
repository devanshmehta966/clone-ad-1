import { z } from 'zod'

export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().optional(),
  businessEmail: z.string().email('Invalid business email').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().url('Invalid website URL').optional().or(z.literal(''))
})

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  businessName: z.string().optional(),
  businessEmail: z.string().email('Invalid business email').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().url('Invalid website URL').optional().or(z.literal(''))
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type SignUpData = z.infer<typeof SignUpSchema>
export type SignInData = z.infer<typeof SignInSchema>
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>