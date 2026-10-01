'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function TurnstileCaptcha({
  action,
  onTokenChange,
}: {
  action: string;
  onTokenChange: (token: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      action,
      callback: (token: string) => {
        setWidgetError(false);
        onTokenChangeRef.current(token);
      },
      'expired-callback': () => onTokenChangeRef.current(null),
      'error-callback': () => {
        setWidgetError(true);
        onTokenChangeRef.current(null);
      },
    });

    return () => window.turnstile?.remove(widgetId);
  }, [action, scriptReady, siteKey]);

  return (
    <div className="space-y-2" aria-label="Security verification">
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onError={() => setWidgetError(true)}
        />
      )}
      <div className="flex min-h-[66px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#17171d] px-2">
        {!siteKey ? (
          <p role="alert" className="text-center text-xs text-red-300">
            Security verification is not configured.
          </p>
        ) : (
          <>
            {!scriptReady && !widgetError && <span className="text-xs text-zinc-500">Loading security check...</span>}
            <div ref={containerRef} />
          </>
        )}
      </div>
      {widgetError && (
        <p role="alert" className="text-xs text-red-300">
          Security check unavailable. Refresh the page and try again.
        </p>
      )}
    </div>
  );
}