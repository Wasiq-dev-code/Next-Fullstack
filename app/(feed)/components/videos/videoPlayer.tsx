'use client';

import { VideoDetails } from '@/lib/types/video';
import Image from 'next/image';
import Link from 'next/link';

export default function VideoPlayer({ video }: { video: VideoDetails }) {
  return (
    <div className="w-full">
      {/* Video Player Container */}
      <div className="relative aspect-video bg-black rounded-t-3xl overflow-hidden">
        <video
          src={video.video.url}
          controls
          className="w-full h-full"
          poster={video.thumbnail?.url}
        />
      </div>

      {/* Video Info Section */}
      <div className="bg-linear-to-b from-white to-slate-50 p-6 space-y-6">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          {video.title}
        </h1>

        {/* Meta Stats */}
        <div className="flex items-center gap-6 text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {video.likesCount}
              </p>
              <p className="text-xs text-slate-500">Likes</p>
            </div>
          </div>

          <div className="h-12 w-px bg-slate-300"></div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {video.uploadedAt}
              </p>
              <p className="text-xs text-slate-500">Uploaded</p>
            </div>
          </div>
        </div>

        {/* Owner Card */}
        <Link href={`/profile/${video.owner._id}`}>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group border-2 border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <Image
                  src={video.owner.profilePhoto.url}
                  alt={video.owner.username}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
            </div>

            <div className="flex-1">
              <p className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {video.owner.username}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                View profile
              </p>
            </div>

            <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
              <svg
                className="w-6 h-6"
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
          </div>
        </Link>

        {/* Description */}
        {video.description && (
          <div className="p-5 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-linear-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Description</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
