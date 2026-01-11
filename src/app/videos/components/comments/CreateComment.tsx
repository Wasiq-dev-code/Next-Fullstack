'use client';

import { useState } from 'react';
import { apiClient } from '@/src/lib/api-client';
import type { Comment, CreateCommentResponse } from '@/src/lib/types/comment';
import { useNotification } from '@/src/app/components/providers/notification';

export default function CreateComment({
  videoId,
  onCreated,
}: {
  videoId: string;
  onCreated: (comment: Comment) => void;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  async function submit() {
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res: CreateCommentResponse = await apiClient.createVideoComment(
        videoId,
        {
          content: text,
        },
      );

      onCreated(res.comment);
      setText('');
      showNotification('Your Comment Created', 'success');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 mb-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 border px-3 py-2 rounded"
      />
      <button onClick={submit} disabled={loading}>
        Post
      </button>
    </div>
  );
}
