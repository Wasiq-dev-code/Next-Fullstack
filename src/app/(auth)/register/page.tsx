'use client';

import UploadExample from '@/components/fileUploads';
import AuthShell from '@/components/auth/AuthShell';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import RecaptchaV3, { type RecaptchaV3Handle } from '@/components/auth/RecaptchaV3';
import OAuthSignInButton from '@/components/auth/OAuthSignInButton';
import { Input } from '@/components/ui/input';
import useRegisterUser, { LANGUAGES } from '@/hooks/user/useRegisterUser';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

const inputCls =
  'bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm ' +
  'focus-visible:ring-2 focus-visible:ring-purple-500/60 aria-[invalid=true]:border-red-400/70';
const selectCls =
  'bg-[#1e1f24] border border-white/10 text-white w-full h-9 text-sm rounded-md px-2 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 ' +
  'aria-[invalid=true]:border-red-400/70';

function FieldShell({
  id, label, error, hint, children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-gray-400">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-gray-500 text-xs">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-400 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}
const STRENGTH = [
  { label: 'Too short', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-yellow-500' },
  { label: 'Good', color: 'bg-green-500' },
  { label: 'Strong', color: 'bg-green-400' },
];

export default function UserRegister() {
  const {
    values, setters, profilePhotoUrl, setPhoto, timezones,
    errors, touch, clearServerError, handleSubmit, submitting,
  } = useRegisterUser();

  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const recaptchaRef = useRef<RecaptchaV3Handle>(null);
  const strength = useMemo(() => passwordStrength(values.password), [values.password]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!captchaToken) {
      await handleSubmit(event, '', '');
      return;
    }

    let recaptchaToken = '';
    try {
      recaptchaToken = await recaptchaRef.current?.execute() ?? '';
    } catch {
      await handleSubmit(event, captchaToken, '');
      return;
    }

    const attempted = await handleSubmit(event, captchaToken, recaptchaToken);
    if (attempted) {
      setCaptchaToken(null);
      setCaptchaKey((key) => key + 1);
    }
  };

  // Props shared by every control: id, a11y wiring, blur tracking.
  const a11y = (id: string, hint = false) => ({
    id,
    name: id,
    disabled: submitting,
    'aria-invalid': Boolean(errors[id]),
    'aria-describedby':
      errors[id] ? `${id}-error` : hint ? `${id}-hint` : undefined,
    onBlur: () => touch(id),
  });

  const change =
    (id: string, set: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      set(e.target.value);
      clearServerError(id);
    };

  return (
    <AuthShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase text-violet-300">Join the conversation</p>
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-zinc-400">We&apos;ll email you a 6-digit code to confirm your address.</p>
        </header>

        <form onSubmit={submit} noValidate className="space-y-5">
          {errors.general && (
            <p role="alert" className="text-red-400 text-sm border border-red-400/30 bg-red-400/5 rounded-lg px-3 py-2">
              {errors.general}
            </p>
          )}

          <fieldset className="space-y-3" disabled={submitting}>
            <legend className="text-sm font-medium text-white mb-2">Account</legend>

            <FieldShell id="username" label="Username" error={errors.username}>
              <Input
                {...a11y('username')}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="e.g. cooluser99"
                value={values.username}
                onChange={change('username', setters.setUsername)}
                className={inputCls}
              />
            </FieldShell>

            <FieldShell id="email" label="Email address" error={errors.email}>
              <Input
                {...a11y('email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={change('email', setters.setEmail)}
                className={inputCls}
              />
            </FieldShell>

            <FieldShell
              id="password"
              label="Password"
              error={errors.password}
              hint="At least 8 characters."
            >
              <div className="relative">
                <Input
                  {...a11y('password', true)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={values.password}
                  onChange={change('password', setters.setPassword)}
                  className={`${inputCls} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-2 text-xs text-gray-400 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:text-purple-400"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {values.password && (
                <div className="flex items-center gap-2 pt-1" aria-live="polite">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= strength ? STRENGTH[strength].color : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{STRENGTH[strength].label}</span>
                </div>
              )}
            </FieldShell>

            <div id="profilePhoto" tabIndex={-1} className="space-y-1 focus:outline-none">
              <span className="text-xs text-gray-400">Profile photo</span>
              {profilePhotoUrl ? (
                <div className="flex items-center gap-3 border border-white/10 rounded-xl p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profilePhotoUrl}
                    alt="Your uploaded profile photo"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="text-green-400 text-xs flex-1">Photo uploaded</span>
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="text-xs text-gray-400 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:text-purple-400"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 cursor-pointer transition-colors">
                  <UploadExample
                    FileType="image"
                    visibility="public"
                    onSuccess={(res) => {
                      setPhoto({ url: res.url, fileId: res.fileId });
                      touch('profilePhoto');
                    }}
                  />
                </div>
              )}
              {errors.profilePhoto && (
                <p role="alert" className="text-red-400 text-xs">{errors.profilePhoto}</p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-3" disabled={submitting}>
            <legend className="text-sm font-medium text-white mb-2">Location</legend>

            <FieldShell id="location.country" label="Country code" error={errors['location.country']} hint="Two-letter ISO code">
              <Input
                {...a11y('location.country')}
                autoComplete="country-name"
                placeholder="e.g. PK"
                value={values.country}
                onChange={change('location.country', setters.setCountry)}
                className={inputCls}
              />
            </FieldShell>

            <div className="grid grid-cols-2 gap-3">
              <FieldShell id="location.region" label="State / Province" error={errors['location.region']}>
                <Input
                  {...a11y('location.region')}
                  autoComplete="address-level1"
                  placeholder="e.g. Sindh"
                  value={values.region}
                  onChange={change('location.region', setters.setRegion)}
                  className={inputCls}
                />
              </FieldShell>
              <FieldShell id="location.city" label="City" error={errors['location.city']}>
                <Input
                  {...a11y('location.city')}
                  autoComplete="address-level2"
                  placeholder="e.g. Karachi"
                  value={values.city}
                  onChange={change('location.city', setters.setCity)}
                  className={inputCls}
                />
              </FieldShell>
            </div>
          </fieldset>

          <fieldset className="space-y-3" disabled={submitting}>
            <legend className="text-sm font-medium text-white mb-2">Preferences</legend>

            <div className="grid grid-cols-2 gap-3">
              <FieldShell id="preferences.language" label="Language" error={errors['preferences.language']}>
                <select
                  {...a11y('preferences.language')}
                  value={values.language}
                  onChange={change('preferences.language', setters.setLanguage)}
                  className={selectCls}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </FieldShell>

              <FieldShell id="preferences.timezone" label="Time zone" error={errors['preferences.timezone']}>
                <select
                  {...a11y('preferences.timezone')}
                  value={values.timezone}
                  onChange={change('preferences.timezone', setters.setTimezone)}
                  className={selectCls}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </FieldShell>
            </div>
          </fieldset>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Security check</p>
            <TurnstileCaptcha
              key={captchaKey}
              action="register"
              onTokenChange={setCaptchaToken}
            />
            <RecaptchaV3 ref={recaptchaRef} action="register" />
          </div>

          <button
            type="submit"
            disabled={submitting || !captchaToken}
            aria-busy={submitting}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <OAuthSignInButton
          token={captchaToken}
          action="register"
          provider="google"
          executeRecaptcha={async () => {
            const token = await recaptchaRef.current?.execute();
            if (!token) throw new Error('Google reCAPTCHA is not ready.');
            return token;
          }}
          disabled={submitting}
          onChallengeConsumed={() => {
            setCaptchaToken(null);
            setCaptchaKey((key) => key + 1);
          }}
        />
        <OAuthSignInButton
          token={captchaToken}
          action="register"
          provider="github"
          executeRecaptcha={async () => {
            const token = await recaptchaRef.current?.execute();
            if (!token) throw new Error('Google reCAPTCHA is not ready.');
            return token;
          }}
          disabled={submitting}
          onChallengeConsumed={() => {
            setCaptchaToken(null);
            setCaptchaKey((key) => key + 1);
          }}
        />

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200 hover:underline focus-visible:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}