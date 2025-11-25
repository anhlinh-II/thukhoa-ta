"use client";

import React, { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import CommentEditor from './CommentEditor';
const { Text } = Typography;

export default function CommentItem({ comment, onReply, onDelete }: any) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="border-b py-3">
      <div className="flex justify-between">
        <div>
          <div className="font-semibold">{comment.createdByUser?.username || comment.createdBy}</div>
          <div className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <Space>
            <Button size="small" onClick={() => setShowReply(s => !s)}>Trả lời</Button>
            {comment.canDelete && <Button danger size="small" onClick={() => onDelete && onDelete(comment.id)}>Xóa</Button>}
          </Space>
        </div>
      </div>
      <div className="mt-2">
        <Text>{comment.content}</Text>
      </div>

      {showReply && (
        <div className="mt-3 ml-6">
          <CommentEditor onCancel={() => setShowReply(false)} onSubmit={(text: string) => { onReply && onReply(comment.id, text); setShowReply(false); }} />
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div className="mt-3 ml-6 space-y-2">
          {comment.children.map((c: any) => (
            <div key={c.id} className="bg-gray-50 p-2 rounded"> 
              <div className="text-sm font-medium">{c.createdByUser?.username || c.createdBy}</div>
              <div className="text-sm text-gray-700">{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
