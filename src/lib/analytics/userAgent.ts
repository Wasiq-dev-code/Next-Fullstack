import { UAParser } from 'ua-parser-js'; // ua-parser-js v2: npm i ua-parser-js
import type { DeviceType } from '@/model/videoView.model';

export function parseUserAgent(ua: string | null): {
  device: DeviceType;
  browser: string;
  os: string;
} {
  const result = new UAParser(ua ?? '').getResult();

  const type = result.device?.type;
  const device: DeviceType =
    type === 'mobile' ? 'mobile' : type === 'tablet' ? 'tablet' : 'desktop';

  return {
    device,
    browser: result.browser?.name || 'Unknown',
    os: result.os?.name || 'Unknown',
  };
}