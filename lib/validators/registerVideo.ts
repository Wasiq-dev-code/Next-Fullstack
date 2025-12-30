import z from 'zod';

export const registerVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: z.object({
    url: z.string().url('Invalid profile thumbnail url'),
    fileId: z.string().min(1, 'fileid is required'),
  }),
  video: z.object({
    url: z.string().url('Invalid profile video url'),
    fileId: z.string().min(1, 'fileid is required'),
  }),
});

export type RegisterVideoDTO = z.infer<typeof registerVideoSchema>;
