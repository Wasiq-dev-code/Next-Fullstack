import z from 'zod';

export const ReplyCommentList = z.object({
  commentId: z.string(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(50).default(5),
});

export type ReplyCommentType = z.infer<typeof ReplyCommentList>;
