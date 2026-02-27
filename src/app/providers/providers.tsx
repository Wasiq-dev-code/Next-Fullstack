'use client';
import { ImageKitProvider } from '@imagekit/next';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReduxProvider from '@/store/ReduxProvider';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

const urlEndPoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
if (!urlEndPoint) {
  throw new Error('Missing NEXT_PUBLIC_URL_ENDPOINT environment variable.');
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  );

  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ReduxProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ImageKitProvider urlEndpoint={urlEndPoint}>
              {children}
            </ImageKitProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </ReduxProvider>
    </SessionProvider>
  );
}
