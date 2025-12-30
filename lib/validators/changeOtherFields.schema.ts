import z from 'zod';

export const changeOtherFieldsSchema = z
  .object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    profilePhoto: z
      .object({
        url: z.string().url(),
        fileId: z.string(),
      })
      .optional(),
  })
  .refine((data) => data.username || data.email || data.profilePhoto, {
    message: 'Nothing to update',
    path: ['_form'],
  });

export type ChangeOtherFields = z.infer<typeof changeOtherFieldsSchema>;
