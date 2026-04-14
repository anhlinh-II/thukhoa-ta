"use client";

import React, { useState } from 'react';
import { Button, Space, Typography, Avatar } from 'antd';
import CommentEditor from './CommentEditor';
import { quizCommentService } from '@/share/services/quiz_comment/quiz-comment.service';
const { Text } = Typography;

function AvatarOrInitials({ user, size }: any) {
  const url = user?.avatarUrl;
  const name = user?.username || user?.createdBy || 'U';
  if (url) return <Avatar src={url} size={size} />;
  return <Avatar size={size}>{(name || 'U').charAt(0).toUpperCase()}</Avatar>;
}

export default function CommentItem({ comment, onReply, onDelete }: any) {
  // If this component is rendered for a comment that has a parentId
  // (i.e. it's a reply) and the surrounding list already renders
  // all comments (including replies), we should avoid rendering
  // the reply here to prevent duplicate display. Replies will be
  // shown when expanding their parent via `toggleReplies`.
  const isReply = comment?.parentId !== undefined && comment?.parentId !== null;
  if (isReply) {
    return null;
  }
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const username = comment.createdByUser?.username || comment.createdBy || 'User';

  async function toggleReplies() {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    // load replies if not loaded - fetch all descendants and flatten to one level
    if (!replies) {
      setLoadingReplies(true);
      try {
        const MAX_REQUESTS = 20; // safety limit to avoid too many API calls
        const MAX_REPLIES = 200; // cap total replies returned
        const flat: any[] = [];
        const queue: number[] = [];
        let requests = 0;

        // start with direct children of root comment
        queue.push(comment.id);

        // we will perform BFS over the reply tree
        while (queue.length > 0 && requests < MAX_REQUESTS && flat.length < MAX_REPLIES) {
          const current = queue.shift()!;
          requests++;
          try {
            const res = await quizCommentService.getReplies(current, 0, 100);
            const list = res?.content || res?.data?.content || res || [];
            const items = list?.content ? list.content : (Array.isArray(list) ? list : (list?.data || []));
            if (Array.isArray(items) && items.length > 0) {
              for (const it of items) {
                // push to flat list (we'll display all items except the root itself)
                if (it.id !== comment.id) flat.push(it);
                // enqueue child's id to fetch its children (to flatten deeper levels)
                if (it.id && flat.length < MAX_REPLIES) queue.push(it.id);
              }
            }
          } catch (e) {
            console.error('Failed to fetch replies for', current, e);
          }
        }

        setReplies(flat);
      } catch (e) {
        console.error(e);
        setReplies([]);
      } finally {
        setLoadingReplies(false);
        setShowReplies(true);
      }
    } else {
      setShowReplies(true);
    }
  }

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <AvatarOrInitials user={comment.createdByUser} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{username}</div>
              <div className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <Space>
                <Button size="small" type="link" onClick={() => setShowReply(s => !s)}>Trả lời</Button>
                {comment.canDelete && <Button danger size="small" type="link" onClick={() => onDelete && onDelete(comment.id)}>Xóa</Button>}
              </Space>
            </div>
          </div>

          <div className="mt-2">
            <Text>{comment.content}</Text>
          </div>

          <div className="mt-2">
            {comment.childrenCount > 0 && (
              <Button type="link" size="small" onClick={toggleReplies}>{showReplies ? 'Ẩn trả lời' : `Xem trả lời (${comment.childrenCount})`}</Button>
            )}
          </div>

          {showReply && (
            <div className="mt-3">
              <CommentEditor replyTo={username} onCancel={() => setShowReply(false)} onSubmit={(text: string) => { onReply && onReply(comment.id, text); setShowReply(false); }} />
            </div>
          )}

          {showReplies && (
            <div className="mt-3 pl-6 ml-6 border-l border-gray-200 space-y-3">
              {loadingReplies ? (
                <div className="text-sm text-gray-500">Đang tải trả lời...</div>
              ) : (
                (replies || []).map((r: any) => (
                  <div key={r.id} className="flex gap-3 items-start ml-4">
                    <div className="flex-shrink-0"><AvatarOrInitials user={r.createdByUser} size="small" /></div>
                    <div className="flex-1 bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium">{r.createdByUser?.username || r.createdBy}</div>
                      <div className="text-sm text-gray-700">{r.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
