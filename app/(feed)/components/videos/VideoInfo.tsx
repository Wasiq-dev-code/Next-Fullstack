'use client';
import { VideoFeed } from '@/lib/types/video';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type props = {
  videoObj: VideoFeed;
};

export default function VideoInfo({ videoObj }: props) {
  const [showProfile, setShowProfile] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Video Thumbnail and Info Section */}
      <div className="flex gap-6">
        {/* Video Thumbnail */}
        <div className="shrink-0">
          <div className="relative w-48 h-36 rounded-xl overflow-hidden bg-linear-to-br from-slate-200 to-slate-300 group cursor-pointer">
            <Image
              width={50}
              height={50}
              src={videoObj.thumbnail.url}
              alt={videoObj.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
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
        </div>

        {/* Video Details */}
        <div className="flex-1 space-y-3">
          <h3 className="text-xl font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
            {videoObj.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-slate-500">
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
              12.5K views
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
              2 days ago
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="px-4 py-2 bg-linear-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
            >
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
              {showProfile ? 'Hide Profile' : 'View Profile'}
            </button>

            <button
              onClick={() => setShowVideo(!showVideo)}
              className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {showVideo ? 'Hide Video' : 'View Video'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info Dropdown */}
      {showProfile && (
        <div className="mt-4 p-5 bg-linear-to-r from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200 animate-in slide-in-from-top duration-300">
          <Link
            href={`/profile/${videoObj.owner._id}`}
            className="flex items-center gap-4 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <Image
                  height={50}
                  width={50}
                  src={videoObj.owner.profilePhoto.url}
                  alt={videoObj.owner.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {videoObj.owner.username}
              </h4>
              <p className="text-sm text-slate-500">
                @{videoObj.owner.username.toLowerCase()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ID: {videoObj.owner._id}
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
          </Link>
        </div>
      )}

      {/* Video Details Dropdown */}
      {showVideo && (
        <div className="mt-4 p-5 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 animate-in slide-in-from-top duration-300">
          <Link href={`/videos/${videoObj._id}`} className="block group">
            <div className="flex gap-4 items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-24 rounded-lg overflow-hidden ring-4 ring-white shadow-lg">
                  <Image
                    width={50}
                    height={50}
                    src={videoObj.thumbnail.url}
                    alt={videoObj.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <svg
                      className="w-5 h-5 text-blue-600 ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  {videoObj.title}
                </h4>
                <p className="text-sm text-slate-500 mb-3">
                  Watch the full video
                </p>

                <div className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                  <span>Play Now</span>
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
  );
}
