import { initTRPC } from '@trpc/server';
import { getAuthSession } from './routers/auth';

export const createTRPCContext = async () => {
  const session = await getAuthSession();

  return {
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error('Unauthorized');
  }

  return next();
});
