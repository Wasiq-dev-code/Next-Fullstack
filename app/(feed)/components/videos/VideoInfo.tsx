'use client';
import { VideoFeed } from '@/lib/types/video';
import Link from 'next/link';
import { useState } from 'react';

type props = {
  videoObj: VideoFeed;
};

export default function VideoInfo({ videoObj }: props) {
  const [showProfile, setShowProfile] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  console.log(videoObj);

  return (
    <div>
      <button onClick={() => setShowProfile(!showProfile)}>View Profile</button>
      {showProfile && (
        <Link href={`/profile/${videoObj.owner._id}`}>
          {videoObj.owner._id}
          {videoObj.owner.profilePhoto.url}
          {videoObj.owner.username}
        </Link>
      )}

      <button onClick={() => setShowVideo(!showVideo)}>View Video</button>
      {showVideo && (
        <Link href={`/videos/${videoObj._id}`}>
          {videoObj.thumbnail.url}
          {videoObj.title}
        </Link>
      )}
    </div>
  );
}
