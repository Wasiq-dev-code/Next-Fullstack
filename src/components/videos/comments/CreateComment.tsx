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
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-10 flex-1 rounded-lg border border-white/10 bg-[#20222b] px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
      />
      <button
        type="button"
        onClick={submit}
        disabled={loading || !text.trim()}
        className="min-h-10 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Posting..' : 'Comment'}
      </button>
    </div>
  );
}
