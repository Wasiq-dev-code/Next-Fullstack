'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Comment, CreateReplyResponse } from '@/lib/types/comment';
import { useNotification } from '../providers/notification';

export default function CreateReply({
  parentCommentId,
  onCreated,
}: {
  parentCommentId: string;
  onCreated: (reply: Comment) => void;
}) {
  const [text, setText] = useState('');
  const { showNotification } = useNotification();

  async function submit() {
    if (!text.trim()) return;

    const res: CreateReplyResponse = await apiClient.createReply(
      parentCommentId,
      {
        content: text,
      },
    );

    onCreated(res.reply);
    setText('');
    showNotification('Reply Created', 'success');
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply..."
        className="flex-1 border px-2 py-1 rounded text-sm"
      />
      <button onClick={submit}>Reply</button>
    </div>
  );
}
