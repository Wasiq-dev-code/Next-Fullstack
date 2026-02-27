'use client';

import { useState } from 'react';
import { useNotification } from '@/components/notification';
import { useAppDispatch } from '@/store/store';
import { createComment } from '@/store/thunks/comments.thunk';

export default function CreateComment({ videoId }: { videoId: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const dispatch = useAppDispatch();

  async function submit() {
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      await dispatch(createComment({ videoId, content: text })).unwrap();
      setText('');
      showNotification('Your Comment Created', 'success');
    } catch {
      showNotification('Failed to create comment', 'error');
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
        {loading ? 'Posting..' : 'Comment'}
      </button>
    </div>
  );
}
