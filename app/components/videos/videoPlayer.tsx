'use client';

import { VideoDetails } from '@/lib/types/result';
import Image from 'next/image';

interface VideoPlayerProps {
  video: VideoDetails;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Video */}
      <video src={video.video.url} controls className="w-full rounded-lg" />

      {/* Title */}
      <h1 className="text-xl font-semibold mt-4">{video.title}</h1>

      {/* Owner */}
      <div className="flex items-center gap-3 mt-2">
        <Image
          src={video.owner.profilePhoto}
          alt={video.owner.username}
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="font-medium">{video.owner.username}</span>
      </div>

      {/* Meta */}
      <div className="flex gap-4 text-sm text-gray-500 mt-2">
        <span>{video.likes} likes</span>
        <span>{video.uploadedAt}</span>
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-700">{video.description}</p>
    </div>
  );
}
