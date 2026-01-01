'use client';

import { VideoDetails } from '@/lib/types/video';
import Image from 'next/image';
import Link from 'next/link';

export default function VideoPlayer({ video }: { video: VideoDetails }) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Video Card */}
      <div className="rounded-2xl overflow-hidden bg-black shadow-lg">
        <video src={video.video.url} controls className="w-full aspect-video" />
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold leading-tight">{video.title}</h1>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{video.likesCount} likes</span>
        <span>{video.uploadedAt}</span>
      </div>

      {/* Owner Card */}
      <Link href={`/profile/${video.owner._id}`}>
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition cursor-pointer">
          <Image
            src={video.owner.profilePhoto.url}
            alt={video.owner.username}
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
          <div>
            <p className="font-medium leading-none">{video.owner.username}</p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
        </div>
      </Link>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed">{video.description}</p>
    </div>
  );
}
