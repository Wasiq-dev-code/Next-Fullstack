'use client';
import { ImageKitProvider } from '@imagekit/next';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReduxProvider from '@/src/store/ReduxProvider';

const queryClient = new QueryClient();
const urlEndPoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
if (!urlEndPoint) {
  throw new Error('Missing NEXT_PUBLIC_URL_ENDPOINT environment variable.');
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <ReduxProvider>
        <QueryClientProvider client={queryClient}>
          <ImageKitProvider urlEndpoint={urlEndPoint}>
            {children}
          </ImageKitProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}
