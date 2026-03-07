import { getUploadAuthParams } from '@imagekit/next/server';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import z from 'zod';
import {
  deleteFileFromImageKit,
  getImageKitFileOwner,
} from '@/lib/videofallback/imageKitOps';
import { TRPCError } from '@trpc/server';

export const imageKitRouter = router({
  getPublicAuth: publicProcedure.query(() => {
    return getUploadAuthParams({
      privateKey: process.env.IMAGE_PRIVATE_KEY!,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
    });
  }),

  getPrivateAuth: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...getUploadAuthParams({
        privateKey: process.env.IMAGE_PRIVATE_KEY!,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
      }),
      userId: ctx.session?.user.id,
    };
  }),

  deletePrivateFile: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const { fileId } = input;

      const owner = await getImageKitFileOwner(fileId);

      if (!owner || owner !== userId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file from ImageKit',
        });
      }

      const deleted = await deleteFileFromImageKit(fileId);

      if (!deleted) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file from ImageKit',
        });
      }

      return {
        message: 'File deteled Successfulyy',
        fileId,
      };
    }),

  deleteTempFile: publicProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { fileId } = input;

      const deleted = await deleteFileFromImageKit(fileId);

      if (!deleted) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        });
      }

      return { success: deleted };
    }),
});
