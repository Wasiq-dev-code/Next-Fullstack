This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## CAPTCHA configuration

Create a Cloudflare Turnstile widget for your deployment hostnames and configure these environment variables:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-v3-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-v3-secret-key
```

Register both widgets for your deployment hostnames. The reCAPTCHA keys must be for a v3 site key. Site keys are public; keep both secret keys server-side. Both CAPTCHA checks are required on login, registration, email verification, and forgot-password requests. The reset-password form also requires reCAPTCHA v3. reCAPTCHA v3 requests are verified for the expected action and must score at least `0.5`. Verification fails closed when a required secret is missing. `NEXTAUTH_SECRET` must also be configured for the short-lived Google OAuth CAPTCHA proof.

## GitHub sign-in

Configure the provider credentials and base URL alongside the existing CAPTCHA variables:

```env
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

For GitHub, create an OAuth App in GitHub Developer Settings and set its authorization callback URL to `${NEXTAUTH_URL}/api/auth/callback/github` (for local development, `http://localhost:3000/api/auth/callback/github`). For Google, register `${NEXTAUTH_URL}/api/auth/callback/google` as an authorized redirect URI. Use the matching client ID and secret for each provider. GitHub sign-in is available on login and registration and requires both CAPTCHA checks, just like Google sign-in.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
