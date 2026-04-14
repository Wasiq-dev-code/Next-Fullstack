import { CommentSchema } from '@/validators/comment';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ParentCommentListSchema } from '@/validators/parentCommentList';
import { ReplyCommentCreate } from '@/validators/ReplyCommentCreate';
import { ReplyCommentList } from '@/validators/ReplyCommentList';

export const commentRouter = router({
  createComment: protectedProcedure
    .input(CommentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const comment = await ctx.prisma.comment.create({
          data: {
            content: input.content,
            videoId: input.videoId,
            userId: ctx.session.user.id,
          },
          include: {
            user: {
              select: { username: true, profilePhotoUrl: true },
            },
            _count: {
              select: { likes: true },
            },
          },
        });

        return {
          id: comment?.id,
          content: comment?.content,
          createdAt: comment?.createdAt,

          owner: comment?.user,
          likesCount: comment?._count.likes ?? 0,
          repliesCount: comment?.repliesCount ?? 0,
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

      const comments = await ctx.prisma.comment.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          videoId: videoId,
          parentComment: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: { id: true, username: true, profilePhotoUrl: true },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
          likes: userId
            ? {
                where: {
                  userId: userId,
                },
                select: { id: true },
              }
            : false,
        },
      });
      // HasMore NextCursor logic
      let nextCursor: typeof cursor = undefined;
      if (comments.length > limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments: comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          owner: c.user,
          likesCount: c._count.likes,
          repliesCount: c._count.replies,
          isLiked: userId ? c.likes.length > 0 : false,
        })),
        nextCursor,
      };
    }),

  createReply: protectedProcedure
    .input(ReplyCommentCreate)
    .mutation(async ({ ctx, input }) => {
      const { commentId, videoId, content } = input;
      const userId = ctx.session.user.id;

      const reply = await ctx.prisma.$transaction(async (tx) => {
        const parent = await tx.comment.findUnique({
          where: { id: commentId },
        });

        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent comment not found',
          });
        }

        const createdReply = await tx.comment.create({
          data: {
            content: content.trim(),
            userId: userId,
            videoId: videoId,
            parentCommentId: commentId,
          },
          include: {
            user: {
              select: {
                username: true,
                profilePhotoUrl: true,
              },
            },
          },
        });

        await tx.comment.update({
          where: { id: commentId },
          data: {
            repliesCount: { increment: 1 },
          },
        });

        return createdReply;
      });

      return {
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        owner: reply.user,
        likesCount: 0,
        repliesCount: 0,
      };
    }),

  getReplies: publicProcedure
    .input(ReplyCommentList)
    .query(async ({ ctx, input }) => {
      const { commentId, cursor, limit } = input;
      const userId = ctx.session?.user?.id;

      const replies = await ctx.prisma.comment.findMany({
        take: limit + 1, // HasMore trick
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          parentCommentId: commentId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profilePhotoUrl: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          likes: userId
            ? { where: { userId: userId }, select: { id: true } }
            : false,
        },
      });

      let nextCursor: typeof cursor = undefined;
      if (replies.length > limit) {
        const nextItem = replies.pop();
        nextCursor = nextItem!.id;
      }

      return {
        comments: replies.map((r) => ({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt,
          owner: r.user,
          likesCount: r._count.likes,
          isLiked: userId ? r.likes.length > 0 : false,
        })),
        nextCursor,
      };
    }),
});
