'use client';
import { VideoFeed } from '@/types/video';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

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

type props = {
  videoObj: VideoFeed;
};

export default function VideoInfo({ videoObj }: props) {
  const [showProfile, setShowProfile] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const thumbnailSrc = getImageSource(videoObj.thumbnail?.url);

  return (
    <div className="flex h-full flex-col">
      {/* Thumbnail: full width on top of the card */}
      <div className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-[#2a2d38]">
        {thumbnailSrc ? (
          <Image
            fill
            src={thumbnailSrc}
            alt={videoObj.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No thumbnail
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/35">
          <div className="flex h-11 w-11 scale-0 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-lg transition-all duration-300 group-hover:scale-100">
            <svg
              className="w-6 h-6 text-blue-600 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 cursor-pointer text-lg font-bold leading-snug text-white transition-colors hover:text-violet-300">
          {videoObj.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {(videoObj.viewsCount ?? 0).toLocaleString()} views
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatUploadedDate(videoObj.createdAt)}
          </span>
        </div>

        {/* Action Buttons: always side by side, equal width, pinned to bottom */}
        <div className="mt-auto flex gap-2 pt-2">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {showProfile ? 'Hide Profile' : 'Profile'}
          </button>

          <button
            onClick={() => setShowVideo(!showVideo)}
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white shadow-md shadow-violet-950/30 transition hover:bg-violet-500"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {showVideo ? 'Hide Video' : 'Video'}
          </button>
        </div>

        {/* Profile Info Dropdown */}
        {showProfile && (
          <div className="rounded-xl border border-white/10 bg-[#2a2d38] p-3 animate-in slide-in-from-top duration-300">
            <Link
              href={`/profile/${videoObj.owner._id}`}
              className="group flex items-center gap-3"
            >
              <div className="relative shrink-0">
                <div className="relative h-14 w-14 overflow-hidden rounded-full shadow-lg ring-4 ring-white">
                  {getImageSource(videoObj.owner.profilePhoto?.url) ? (
                    <Image
                      fill
                      src={getImageSource(videoObj.owner.profilePhoto?.url)!}
                      alt={videoObj.owner.username}
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-violet-600 text-xl font-semibold text-white">
                      {videoObj.owner.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-base font-bold text-white transition-colors group-hover:text-violet-300">
                  {videoObj.owner.username}
                </h4>
                <p className="truncate text-sm text-gray-400">
                  @{videoObj.owner.username.toLowerCase()}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  ID: {videoObj.owner._id}
                </p>
              </div>

              <div className="shrink-0 text-violet-400 transition-transform group-hover:translate-x-1">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* Video Details Dropdown */}
        {showVideo && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 animate-in slide-in-from-top duration-300">
            <Link href={`/videos/${videoObj._id}`} className="group block">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="relative h-16 w-24 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10">
                    {thumbnailSrc ? (
                      <Image
                        fill
                        src={thumbnailSrc}
                        alt={videoObj.title}
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-90 shadow-lg transition-transform group-hover:scale-110">
                      <svg
                        className="w-4 h-4 text-blue-600 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-violet-300">
                    {videoObj.title}
                  </h4>
                  <p className="mb-1 text-xs text-gray-400">
                    Watch the full video
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition-all group-hover:gap-3">
                    <span>Play Now</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}