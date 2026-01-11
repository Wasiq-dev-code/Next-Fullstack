import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Invalid Email'),
  username: z
    .string()
    .min(3, 'username too short')
    .max(15, 'username too long'),
  password: z.string().min(8, 'Password should be longer than 8 characters'),
  profilePhoto: z.object({
    url: z.string().url('Invalid profile photo url'),
    fileId: z.string().min(1, 'fileid is required'),
  }),
});

export type RegisterUserType = z.infer<typeof registerUserSchema>;
