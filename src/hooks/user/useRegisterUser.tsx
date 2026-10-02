'use client';

import { useNotification } from '@/components/notification';
import { apiClient } from '@/lib/Api-client/api-client';
import { registerUserSchema } from '@/validators/registerUser.schema';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type FieldErrors = Record<string, string>;

export const FIELD_ORDER = [
  'username',
  'email',
  'password',
  'profilePhoto',
  'location.country',
  'location.region',
  'location.city',
  'preferences.language',
  'preferences.timezone',
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

// Turns a zod issue path into one of the field keys above.
function toFieldKey(path: (string | number)[]) {
  const [first, second] = path;
  return first === 'location' || first === 'preferences'
    ? [first, second].filter(Boolean).join('.')
    : String(first ?? 'general');
}

async function deleteUploadedFile(fileId: string) {
  try {
    await fetch('/api/auth/imageKit-del', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
      keepalive: true,
    });
  } catch (e) {
    console.error('Profile photo cleanup failed', e);
  }
}

export default function useRegisterUser() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Detect defaults on the client only, to avoid hydration mismatches.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setTimezone(tz);
    const lang = navigator.language?.split('-')[0];
    if (lang && LANGUAGES.some((l) => l.value === lang)) setLanguage(lang);
  }, []);

  const timezones = useMemo(() => {
    const list: string[] = Intl.supportedValuesOf?.('timeZone') ?? [];
    return list.includes(timezone) ? list : [timezone, ...list];
  }, [timezone]);

  // Photo handling: replacing or removing a photo deletes the old upload,
  // and an abandoned upload is deleted when the page unmounts.
  const photoIdRef = useRef<string | null>(null);
  const registeredRef = useRef(false);
  photoIdRef.current = profilePhotoId;

  useEffect(() => {
    return () => {
      if (!registeredRef.current && photoIdRef.current) {
        void deleteUploadedFile(photoIdRef.current);
      }
    };
  }, []);

  const setPhoto = useCallback(
    (photo: { url: string; fileId: string } | null) => {
      if (photoIdRef.current && photoIdRef.current !== photo?.fileId) {
        void deleteUploadedFile(photoIdRef.current);
      }
      setProfilePhotoUrl(photo?.url ?? null);
      setProfilePhotoId(photo?.fileId ?? null);
      setServerErrors((p) => ({ ...p, profilePhoto: '' }));
    },
    []
  );

  // Client validation uses the same zod schema as the API route.
  const clientErrors = useMemo<FieldErrors>(() => {
    const result = registerUserSchema.safeParse({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      profilePhoto:
        profilePhotoUrl && profilePhotoId
          ? { url: profilePhotoUrl, fileId: profilePhotoId }
          : undefined,
      location: {
        country: country.trim(),
        region: region.trim(),
        city: city.trim(),
      },
      preferences: { language, timezone },
    });

    const out: FieldErrors = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = toFieldKey(issue.path as (string | number)[]);
        if (!out[key]) out[key] = issue.message;
      }
    }
    if (!profilePhotoUrl) out.profilePhoto = 'Upload a profile photo.';
    return out;
  }, [
    username, email, password, country, region, city,
    language, timezone, profilePhotoUrl, profilePhotoId,
  ]);

  // Show a client error once the field was visited, or after a submit attempt.
  const errors = useMemo<FieldErrors>(() => {
    const out: FieldErrors = {};
    for (const key of FIELD_ORDER) {
      const msg =
        serverErrors[key] ||
        (touched[key] || submitAttempted ? clientErrors[key] : '');
      if (msg) out[key] = msg;
    }
    // Server errors for a whole group (e.g. "location") surface on its first field.
    if (serverErrors.location && !out['location.country'])
      out['location.country'] = serverErrors.location;
    if (serverErrors.preferences && !out['preferences.language'])
      out['preferences.language'] = serverErrors.preferences;
    if (serverErrors.general) out.general = serverErrors.general;
    return out;
  }, [clientErrors, serverErrors, touched, submitAttempted]);

  const touch = useCallback(
    (field: string) => setTouched((p) => ({ ...p, [field]: true })),
    []
  );
  const clearServerError = useCallback(
    (field: string) =>
      setServerErrors((p) =>
        p[field] || p.general ? { ...p, [field]: '', general: '' } : p
      ),
    []
  );

  const focusFirstInvalid = (errs: FieldErrors) => {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) document.getElementById(first)?.focus();
  };

  const handleSubmit = async (
    e: React.FormEvent,
    captchaToken: string,
    recaptchaToken: string,
  ) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitAttempted(true);
    setServerErrors({});

    if (Object.keys(clientErrors).length > 0) {
      focusFirstInvalid(clientErrors);
      return false;
    }

    if (!captchaToken) {
      setServerErrors({ general: 'Complete the security check before continuing.' });
      return false;
    }
    if (!recaptchaToken) {
      setServerErrors({ general: 'Complete the reCAPTCHA check before continuing.' });
      return false;
    }

    setSubmitting(true);
    try {
      const user = await apiClient.registerUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        captchaToken,
        recaptchaToken,
        profilePhoto: { url: profilePhotoUrl!, fileId: profilePhotoId! },
        location: {
          country: country.trim(),
          region: region.trim(),
          city: city.trim(),
        },
        preferences: { language, timezone },
      });

      if (!user) throw new Error('Registration failed. Please try again.');

      registeredRef.current = true; // keep the uploaded photo
      showNotification('Account created. Check your email for the code.', 'success');
      router.push(`/verify/${encodeURIComponent(username.trim())}`);
    } catch (err: unknown) {
      let next: FieldErrors = {};
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      try {
        const parsed = JSON.parse(message);
        if (parsed?.code === 'EMAIL_ALREADY_REGISTERED') {
          next.email = parsed.error;
        } else if (parsed?.issues) {
          for (const [key, msgs] of Object.entries(parsed.issues)) {
            const first = (msgs as string[])?.[0];
            if (first) next[key] = first;
          }
        }
        if (!Object.keys(next).length) {
          next.general = parsed?.error ?? 'Registration failed. Please try again.';
        }
      } catch {
        next = { general: message };
      }
      setServerErrors(next);
      showNotification('Could not create your account', 'error');
      // The photo is kept so a retry doesn't require re-uploading.
      requestAnimationFrame(() => focusFirstInvalid(next));
    } finally {
      setSubmitting(false);
    }
    return true;
  };

  return {
    values: { username, email, password, country, region, city, language, timezone },
    setters: {
      setUsername, setEmail, setPassword, setCountry,
      setRegion, setCity, setLanguage, setTimezone,
    },
    profilePhotoUrl,
    setPhoto,
    timezones,
    errors,
    touch,
    clearServerError,
    handleSubmit,
    submitting,
  };
}