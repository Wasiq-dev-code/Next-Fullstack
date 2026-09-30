import { z } from 'zod';

const isValidTimezone = (tz: string) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const profilePhotoSchema = z.object({
  url: z.string().url('Invalid profile photo URL'),
  fileId: z.string().min(1, 'fileId is required'),
});

const locationSchema = z.object({
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Country must be a 2-letter ISO code')
    .transform((v) => v.toUpperCase()),
  region: z.string().trim().min(1, 'Region is required').max(100),
  city: z.string().trim().min(1, 'City is required').max(100),
});

const preferencesSchema = z
  .object({
    language: z
      .string()
      .trim()
      .regex(/^[a-z]{2}(-[a-z]{2})?$/i, 'Invalid language code')
      .transform((v) => v.toLowerCase())
      .default('en'),
    timezone: z
      .string()
      .trim()
      .refine(isValidTimezone, 'Invalid IANA timezone')
      .default('UTC'),
  })
  .default({ language: 'en', timezone: 'UTC' });

export const registerUserSchema = z.object({
  email: z.string().email('Invalid Email'),
  username: z.string().min(3).max(15),
  password: z.string().min(8, 'Password should be at least 8 characters'),

  profilePhoto: profilePhotoSchema,
  location: locationSchema,
  preferences: preferencesSchema,
});

export type RegisterUserType = z.infer<typeof registerUserSchema>;