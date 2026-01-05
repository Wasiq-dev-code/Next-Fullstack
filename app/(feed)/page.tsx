'use client';

import Header from '../components/Header';
import VideoFeed from './components/videos/videoFeed';

export default function Home() {
  return (
    <main className="p-6">
      <Header />
      <VideoFeed />
    </main>
  );
}
