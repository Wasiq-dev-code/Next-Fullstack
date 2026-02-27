'use client';

import { useState } from 'react';
import { useNotification } from '@/components/notification';
import { useAppDispatch } from '@/store/store';
import { createReply } from '@/store/thunks/comments.thunk';

export default function CreateReply({
  parentCommentId,
  videoId,
}: {
  parentCommentId: string;
  videoId: string;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const dispatch = useAppDispatch();

  async function submit() {
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      await dispatch(
        createReply({ videoId, commentId: parentCommentId, content: text }),
      ).unwrap();
      setText('');
      showNotification('Your reply Created', 'success');
    } catch {
      showNotification('Failed to create reply', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply..."
        className="flex-1 border px-2 py-1 rounded text-sm"
      />
      <button onClick={submit} disabled={loading}>
        {loading ? 'Posting..' : 'Reply'}
      </button>
    </div>
  );
}
