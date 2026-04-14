import { z } from 'zod';

export const CommentSchema = z.object({
  videoId: z.string().cuid(),
  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment too long'),
});

export type CommentType = z.infer<typeof CommentSchema>;
