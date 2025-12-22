'use client';
import { VideoFeed } from '@/lib/types/video';
import Link from 'next/link';

type props = {
  videoObj: VideoFeed;
};

export default function VideoInfo({ videoObj }: props) {
  return (
    <div>
      <Link href={`/profile/${videoObj.owner._id}`}>
        {videoObj.owner._id}
        {videoObj.owner.profilePhoto}
        {videoObj.owner.username}
      </Link>

      <Link href={`/videos/${videoObj._id}`}>
        {videoObj.thumbnail.url}
        {videoObj.title}
      </Link>
    </div>
  );
}
