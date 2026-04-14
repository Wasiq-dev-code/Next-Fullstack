import { z } from 'zod';

export const videoParentCommentSchema = z.object({
  videoId: z.string(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(50).default(10),
});

export type videoParentCommentType = z.infer<typeof videoParentCommentSchema>;
