"use client";
import { ImageKitProvider } from "@imagekit/next"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()
const urlEndPoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={5*60}>
    <QueryClientProvider client={queryClient}>
    <ImageKitProvider urlEndpoint={urlEndPoint}>
    {children}
    </ImageKitProvider>
    </QueryClientProvider>
    </SessionProvider>
}