import { CommentSchema } from '@/validators/comment';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ParentCommentListSchema } from '@/validators/parentCommentList';
import { ReplyCommentCreate } from '@/validators/ReplyCommentCreate';
import { ReplyCommentList } from '@/validators/ReplyCommentList';
import mongoose from 'mongoose';

export const commentRouter = router({
  createComment: protectedProcedure
    .input(CommentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const comment = await ctx.models.Comment.create({
          commentedBy: new mongoose.Types.ObjectId(ctx.session.user.id),
          commentedVideo: new mongoose.Types.ObjectId(input.videoId),
          content: input.content,
          parentComment: null,
        });

        await comment.populate('commentedBy', 'username profilePhoto');

        return {
          id: comment._id?.toString(),
          content: comment.content,
          createdAt: comment.createdAt,
          owner: {
            username: (comment.commentedBy as any)?.username,
            profilePhotoUrl: (comment.commentedBy as any)?.profilePhoto?.url,
          },
          likesCount: 0,
          repliesCount: comment.repliesCount ?? 0,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while creating video comment',
          cause: error,
        });
      }
    }),

  fetchVideoComments: publicProcedure
    .input(ParentCommentListSchema)
    .query(async ({ ctx, input }) => {
      const { videoId, limit, cursor } = input;
      const userId = ctx.session?.user?.id;

      const query: any = {
        commentedVideo: new mongoose.Types.ObjectId(videoId),
        parentComment: null,
      };

      if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      }

      const comments = await ctx.models.Comment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('commentedBy', 'username profilePhoto')
        .lean();

      let nextCursor: string | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = (nextItem as any)?._id?.toString();
      }

      // Get likes count and user liked status for comments
      const likeMap = new Map();
      const userLikedSet = new Set<string>();

      for (const comment of comments) {
        const commentId = (comment as any)._id?.toString();
        const likeCount = await ctx.models.Like.countDocuments({
          comment: (comment as any)._id,
        });
        likeMap.set(commentId, likeCount);
      }

      // Get user's likes if logged in
      if (userId) {
        const userLikes = await ctx.models.Like.find({
          comment: { $in: comments.map((c: any) => c._id) },
          userLiked: new mongoose.Types.ObjectId(userId),
        }).select('comment');
        userLikes.forEach((like: any) => {
          userLikedSet.add(like.comment?.toString() || '');
        });
      }

      return {
        comments: comments.map((c: any) => ({
          id: c._id?.toString(),
          content: c.content,
          createdAt: c.createdAt,
          owner: {
            id: c.commentedBy?._id?.toString(),
            username: c.commentedBy?.username,
            profilePhotoUrl: c.commentedBy?.profilePhoto?.url,
          },
          likesCount: likeMap.get(c._id?.toString()) ?? 0,
          repliesCount: c.repliesCount ?? 0,
          isLiked: userLikedSet.has(c._id?.toString() || ''),
        })),
        nextCursor,
      };
    }),

  createReply: protectedProcedure
    .input(ReplyCommentCreate)
    .mutation(async ({ ctx, input }) => {
      const { commentId, videoId, content } = input;
      const userId = ctx.session.user.id;

      try {
        const parent = await ctx.models.Comment.findById(
          new mongoose.Types.ObjectId(commentId),
        );

        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent comment not found',
          });
        }

        const reply = await ctx.models.Comment.create({
          commentedBy: new mongoose.Types.ObjectId(userId),
          commentedVideo: new mongoose.Types.ObjectId(videoId),
          content: content.trim(),
          parentComment: new mongoose.Types.ObjectId(commentId),
        });

        // Update parent comment reply count
        await ctx.models.Comment.findByIdAndUpdate(
          new mongoose.Types.ObjectId(commentId),
          { $inc: { repliesCount: 1 } },
        );

        await reply.populate('commentedBy', 'username profilePhoto');

        return {
          id: reply._id?.toString(),
          content: reply.content,
          createdAt: reply.createdAt,
          owner: {
            username: (reply.commentedBy as any)?.username,
            profilePhotoUrl: (reply.commentedBy as any)?.profilePhoto?.url,
          },
          likesCount: 0,
          repliesCount: 0,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error while creating reply',
          cause: error,
        });
      }
    }),

  getReplies: publicProcedure
    .input(ReplyCommentList)
    .query(async ({ ctx, input }) => {
      const { commentId, cursor, limit } = input;
      const userId = ctx.session?.user?.id;

      const query: any = {
        parentComment: new mongoose.Types.ObjectId(commentId),
      };

      if (cursor) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      }

      const replies = await ctx.models.Comment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate('commentedBy', 'username profilePhoto')
        .lean();

      let nextCursor: string | undefined = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop();
        nextCursor = (nextItem as any)?._id?.toString();
      }

      // Get likes count and user liked status for replies
      const likeMap = new Map();
      const userLikedSet = new Set<string>();

      for (const reply of replies) {
        const replyId = (reply as any)._id?.toString();
        const likeCount = await ctx.models.Like.countDocuments({
          comment: (reply as any)._id,
        });
        likeMap.set(replyId, likeCount);
      }

      // Get user's likes if logged in
      if (userId) {
        const userLikes = await ctx.models.Like.find({
          comment: { $in: replies.map((r: any) => r._id) },
          userLiked: new mongoose.Types.ObjectId(userId),
        }).select('comment');
        userLikes.forEach((like: any) => {
          userLikedSet.add(like.comment?.toString() || '');
        });
      }

      return {
        comments: replies.map((r: any) => ({
          id: r._id?.toString(),
          content: r.content,
          createdAt: r.createdAt,
          owner: {
            id: r.commentedBy?._id?.toString(),
            username: r.commentedBy?.username,
            profilePhotoUrl: r.commentedBy?.profilePhoto?.url,
          },
          likesCount: likeMap.get(r._id?.toString()) ?? 0,
          isLiked: userLikedSet.has(r._id?.toString() || ''),
        })),
        nextCursor,
      };
    }),
});
