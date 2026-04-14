import { publicProcedure, router } from '../trpc';
import { registerUserSchema } from '@/validators/registerUser.schema';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  register: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();

      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User Already Exists',
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(input.password, 12);
        const user = await ctx.prisma.user.create({
          data: {
            ...input,
            email,
            password: hashedPassword,
            provider: 'credentials',
          },
          select: { id: true },
        });

        return { status: 'success', userId: user.id };
      } catch (error) {
        console.error('Registration Error:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});
