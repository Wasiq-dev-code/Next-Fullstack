import { publicProcedure, router } from '../trpc';
import { registerUserSchema } from '@/validators/registerUser.schema';
import { TRPCError } from '@trpc/server';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';

export const authRouter = router({
  register: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Connecting to database before it's operations.
        await connectToDatabase();

        const existingUser = await User.findOne({ email: input.email });

        // User should not be in DB
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already exists',
          });
        }

        // Creating User
        const newUser = await User.create({
          email: input.email,
          password: input.password,
          profilePhoto: {
            url: input.profilePhoto.url,
            fileId: input.profilePhoto.fileId,
          },
          username: input.username,
          provider: 'credentials',
        });

        return {
          message: 'User registered successfully',
          userId: newUser._id.toString(),
        };
      } catch (error) {
        console.error('User registration failed', error);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }
    }),
});
