'use client';

import Script from 'next/script';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

type GoogleRecaptchaApi = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GoogleRecaptchaApi;
  }
}

export type RecaptchaV3Handle = {
  execute: () => Promise<string>;
};

const RecaptchaV3 = forwardRef<
  RecaptchaV3Handle,
  { action: string }
>(function RecaptchaV3({ action }, ref) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    document.body.classList.add('recaptcha-active');
    return () => document.body.classList.remove('recaptcha-active');
  }, []);

  const execute = useCallback(async () => {
    if (!siteKey || !scriptReady || !window.grecaptcha) {
      throw new Error('Google reCAPTCHA is not ready. Check its site key and try again.');
    }

    return new Promise<string>((resolve, reject) => {
      window.grecaptcha!.ready(() => {
        window.grecaptcha!
          .execute(siteKey, { action })
          .then((token) => {
            if (!token) {
              reject(new Error('Google reCAPTCHA could not verify this request.'));
              return;
            }
            resolve(token);
          })
          .catch(reject);
      });
    });
  }, [action, scriptReady, siteKey]);

  useImperativeHandle(ref, () => ({ execute }), [execute]);

  return (
    <div className="text-xs text-zinc-500" aria-live="polite">
      {siteKey ? (
        <>
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
            strategy="afterInteractive"
            onReady={() => {
              setScriptError(false);
              setScriptReady(true);
            }}
            onError={() => setScriptError(true)}
          />
          <span>
            {scriptError
              ? 'Google reCAPTCHA is unavailable. Refresh the page and try again.'
              : scriptReady
                ? 'Protected by reCAPTCHA. '
                : 'Loading Google reCAPTCHA... '}
            {!scriptError && (
              <>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-300"
                >
                  Privacy
                </a>
                {' and '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-300"
                >
                  Terms
                </a>
                {' apply.'}
              </>
            )}
          </span>
        </>
      ) : (
        <span role="alert" className="text-red-300">
          Google reCAPTCHA is not configured.
        </span>
      )}
    </div>
  );
});

export default RecaptchaV3;
