import Image from "next/image";

export function UserAvatar({
  src,
  alt,
  size = 32,
}: {
  src?: string | { url?: string } | null;
  alt: string;
  size?: number;
}) {
  // Extract string if src is passed as an object
  const rawSrc = typeof src === 'object' && src !== null ? src.url : src;
  
  // Safely check if it's a string before calling .trim()
  const avatarSrc = typeof rawSrc === 'string' ? rawSrc.trim() : null;

  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {avatarSrc && <Image src={avatarSrc} alt={alt} fill className="object-cover" />}
    </div>
  );
}