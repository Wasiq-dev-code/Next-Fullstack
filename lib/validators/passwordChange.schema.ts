import z from 'zod';

export const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });

export type ChangePassInput = z.infer<typeof passwordChangeSchema>;
