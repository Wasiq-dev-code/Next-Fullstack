import { z } from 'zod';

export const ReplyCommentCreate = z.object({
  commentId: z.string(),
  videoId: z.string(),
  content: z.string().min(1),
});

export type ReplyCommentCreateType = z.infer<typeof ReplyCommentCreate>;
