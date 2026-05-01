import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid Email'),
  username: z.string().min(3).max(15),
  password: z.string().min(8, 'Password should be at least 8 characters'),

  profilePhoto: z.object({
    url: z.string().url('Invalid profile photo URL'),
    fileId: z.string().min(1, 'fileId is required'),
  }),
});

export type RegisterUserType = z.infer<typeof registerUserSchema>;
