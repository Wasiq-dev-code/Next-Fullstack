import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/validations/auth';
import { publicProcedure, router } from '../trpc';
import { registerUserSchema } from '@/validators/registerUser.schema';
import prisma from '@/lib/database/prisma';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

export const getAuthSession = () => getServerSession(authOptions);

export const authRouter = router({
  register: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      // IMPLEMENT FRONT END FOR THIS !!!!!!
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User Already Exists',
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      const createUser = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          username: input.username,
          profilePhotoUrl: input.profilePhotoUrl,
          profilePhotoId: input.profilePhotoId,
          provider: 'credentials',
        },
      });

      return {
        message: 'User Registered Successfully',
        userId: createUser.id,
      };
    }),
});
