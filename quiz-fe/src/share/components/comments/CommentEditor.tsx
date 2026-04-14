"use client";

import React, { useState } from 'react';
import { Button, Input, Space } from 'antd';

export default function CommentEditor({ initialValue = '', onCancel, onSubmit, submitting = false, replyTo }: any) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="p-3 bg-white rounded-md border">
      {replyTo && (
        <div className="mb-2 text-sm text-gray-600">Trả lời <span className="font-medium">@{replyTo}</span></div>
      )}
      <Input.TextArea rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder={replyTo ? `Trả lời @${replyTo}...` : 'Viết bình luận...'} />
      <div className="mt-2 text-right">
        <Space>
          <Button onClick={() => { setValue(''); onCancel && onCancel(); }} disabled={submitting}>Hủy</Button>
          <Button type="primary" onClick={() => { if (value && value.trim()) onSubmit(value.trim()); }} loading={submitting}>Gửi</Button>
        </Space>
      </div>
    </div>
  );
}
