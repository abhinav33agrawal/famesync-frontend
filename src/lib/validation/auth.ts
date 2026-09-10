import { z } from 'zod';

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
});

export const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be less than 128 characters' }),
  confirmPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
