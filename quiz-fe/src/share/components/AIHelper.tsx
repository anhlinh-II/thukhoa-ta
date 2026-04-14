"use client";

import React, { useState } from 'react';
import { Modal, Button, Input, Spin } from 'antd';
import { askAi } from '@/share/services/ai.service';
import { RobotOutlined } from '@ant-design/icons';
import messageService from '@/share/services/messageService';

const { TextArea } = Input;

export default function AIHelper({ selectedText }: { selectedText?: string }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(selectedText || '');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleOpen = () => {
    setPrompt(selectedText || '');
    setAnswer(null);
    setOpen(true);
  };

  const handleAsk = async () => {
    if (!prompt || prompt.trim().length === 0) {
      messageService.error('Vui lòng nhập câu hỏi hoặc chọn đoạn văn trong câu hỏi.');
      return;
    }
    setLoading(true);
    try {
      const res = await askAi(prompt);
      const a = res?.answer;
      setAnswer(typeof a === 'string' ? a : JSON.stringify(a));
    } catch (e: any) {
      messageService.error(e?.message || 'Gọi AI thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="default" icon={<RobotOutlined />} onClick={handleOpen}>
        Hỏi AI
      </Button>

      <Modal
        title="Hỏi AI (Gemini)"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        <div className="space-y-3">
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Nhập câu hỏi hoặc paste nội dung câu hỏi để yêu cầu giải thích..."
            rows={4}
          />

          <div className="flex items-center gap-3">
            <Button type="primary" onClick={handleAsk} disabled={loading}>
              {loading ? <><Spin /> Đang hỏi</> : 'Gửi tới AI'}
            </Button>
            <Button onClick={() => { setPrompt(selectedText || ''); setAnswer(null); }}>
              Sử dụng đoạn chọn
            </Button>
            <div className="flex-1 text-right text-xs text-gray-500">Lưu ý: tính năng này gọi API bên server</div>
          </div>

          <div>
            <div className="font-medium mb-2">Kết quả</div>
            <div className="min-h-[120px] p-3 rounded border border-gray-100 bg-gray-50 whitespace-pre-wrap">
              {loading ? <Spin /> : (answer ?? <span className="text-gray-400">Chưa có kết quả</span>)}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
