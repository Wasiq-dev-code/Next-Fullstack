import { router, publicProcedure } from '../trpc';

export const userRouter = router({
  getUser: publicProcedure.query(() => {
    return { data: 'wasiq' };
  }),
});
