import { z } from 'zod';

export const ParentCommentListSchema = z.object({
  videoId: z.string(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(50).default(5),
});

export type ParentCommentListType = z.infer<typeof ParentCommentListSchema>;
