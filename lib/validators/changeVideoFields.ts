import z from 'zod';

export const changeVideoFields = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    thumbnail: z
      .object({
        url: z.string().url(),
        fileId: z.string(),
      })
      .optional(),
  })
  .refine((data) => data.title || data.description || data.thumbnail, {
    message: 'Nothing to update',
  });

export type ChangeVideoFields = z.infer<typeof changeVideoFields>;
