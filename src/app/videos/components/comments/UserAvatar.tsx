'use client';

import Image from 'next/image';

export function UserAvatar({
  src,
  alt,
  size = 32,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {src && <Image src={src} alt={alt} fill className="object-cover" />}
    </div>
  );
}
