export interface Geo {
  country: string;
  region: string;
  city: string;
}

/**
 * Resolve a viewer's location.
 * 1. CDN/host geo headers (Vercel, Cloudflare) - only present once deployed
 * 2. The user's self-declared profile location (works on localhost for
 *    logged-in viewers)
 */
export function resolveGeo(
  headers: Headers,
  userLocation?: Partial<Geo> | null,
): Geo {
  const decode = (v: string | null) => {
    if (!v) return '';
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };

  const country = (
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    userLocation?.country ||
    ''
  )
    .toUpperCase()
    .trim();

  const region =
    decode(headers.get('x-vercel-ip-country-region')) ||
    decode(headers.get('cf-region')) ||
    userLocation?.region ||
    '';

  const city =
    decode(headers.get('x-vercel-ip-city')) ||
    decode(headers.get('cf-ipcity')) ||
    userLocation?.city ||
    '';

  // Cloudflare uses "XX"/"T1" for unknown/Tor
  return {
    country:
      country.length === 2 && !['XX', 'T1'].includes(country) ? country : '',
    region,
    city,
  };
}