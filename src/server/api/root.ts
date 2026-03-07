import { authRouter } from './routers/auth';
import { imageKitRouter } from './routers/imageKit';
import { userRouter } from './routers/user';
import { videoRouter } from './routers/video';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  imageKit: imageKitRouter,
  video: videoRouter,
});

export type AppRouter = typeof appRouter;
