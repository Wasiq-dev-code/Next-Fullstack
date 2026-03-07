import { authRouter } from './routers/auth';
import { imageKitRouter } from './routers/imageKit';
import { userRouter } from './routers/user';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  imageKit: imageKitRouter,
});

export type AppRouter = typeof appRouter;
