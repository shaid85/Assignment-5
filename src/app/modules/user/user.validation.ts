import z from 'zod'
import { IsActive, Role } from './user.interface'

export const createUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'Name must be string' })
    .min(2, { message: 'Name minimum 2' })
    .max(50, { message: 'Name maximum 50' }),
  email: z
    .string({ invalid_type_error: 'Email must be string' })
    .email({ message: 'Email Invalid format' })
    .min(5, { message: 'Email minimum 5' })
    .max(100, { message: 'Email maximum 100' }),
  password: z
    .string({ invalid_type_error: 'Password must be string' })
    .min(8, { message: 'Password minimum 8' })
    .regex(/^(?=.*[A-Z])/, {
      message: 'Password must contain at least 1 uppercase letter.',
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: 'Password must contain at least 1 special character.',
    })
    .regex(/^(?=.*\d)/, {
      message: 'Password must contain at least 1 number.',
    }),
  phone: z
    .string({ invalid_type_error: 'Phone must be string' })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        'Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX',
    })
    .optional(),
  address: z
    .string({ invalid_type_error: 'Address must be string' })
    .max(200, { message: 'Address cannot exceed 200 characters.' })
    .optional(),
})

export const updateUserZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'Name must be string' })
    .min(2, { message: 'Name minimum 2' })
    .max(50, { message: 'Name maximum 50' })
    .optional(),
  password: z
    .string({ invalid_type_error: 'Password must be string' })
    .min(8, { message: 'Password minimum 8' })
    .regex(/^(?=.*[A-Z])/, {
      message: 'Password must contain at least 1 uppercase letter.',
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: 'Password must contain at least 1 special character.',
    })
    .regex(/^(?=.*\d)/, {
      message: 'Password must contain at least 1 number.',
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: 'Phone must be string' })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        'Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX',
    })
    .optional(),
  address: z
    .string({ invalid_type_error: 'Address must be string' })
    .max(200, { message: 'Address cannot exceed 200 characters.' })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isVerified: z
    .boolean({ message: 'isVerified must be true or false' })
    .optional(),
  isDeleted: z
    .boolean({ message: 'isDeleted must be true or false' })
    .optional(),
})
