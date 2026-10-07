'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { VideoFeed } from '@/types/video';

function getImageSource(value?: string) {
  const source = value?.trim();
  return source && source !== '/' ? source : null;
}

function formatUploadedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
}

type Props = {
  videoObj: VideoFeed;
};

export default function VideoInfo({ videoObj }: Props) {
  const thumbnailSrc = getImageSource(videoObj.thumbnail?.url);
  const avatarSrc = getImageSource(videoObj.owner.profilePhoto?.url);
  const videoHref = `/videos/${videoObj._id}`;
  const profileHref = `/profile/${videoObj.owner._id}`;

  return (
    <article className="group">
      {/* Thumbnail */}
      <Link
        href={videoHref}
        className="relative block aspect-video w-full overflow-hidden rounded-xl bg-slate-900"
      >
        {thumbnailSrc ? (
          <Image
            fill
            src={thumbnailSrc}
            alt={videoObj.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No thumbnail
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="mt-3 flex gap-3">
        <Link href={profileHref} className="shrink-0">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-violet-600">
            {avatarSrc ? (
              <Image
                fill
                src={avatarSrc}
                alt={videoObj.owner.username}
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
                {videoObj.owner.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0">
          <Link
            href={videoHref}
            className="line-clamp-2 text-sm font-semibold leading-snug text-white"
          >
            {videoObj.title}
          </Link>

          <Link
            href={profileHref}
            className="mt-1 block truncate text-xs text-slate-400 hover:text-white"
          >
            {videoObj.owner.username}
          </Link>

          <p className="text-xs text-slate-500">
            {(videoObj.viewsCount ?? 0).toLocaleString()} views ·{' '}
            {formatUploadedDate(videoObj.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}