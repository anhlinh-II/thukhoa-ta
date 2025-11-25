"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { quizMockTestService } from '@/share/services/quiz_mock_test/quiz-mocktest.service';
import { Card, Typography, Divider, InputNumber, Button, message } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import CommentList from '@/share/components/comments/CommentList';

const { Text } = Typography;

export default function QuizConfigPage({ params }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;

  const [mockTest, setMockTest] = useState<any>(null);
  const [duration, setDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const view = await quizMockTestService.getViewById(id);
        if (!mounted) return;
        setMockTest(view);
        setDuration(view?.durationMinutes || 60);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleStart = () => {
    if (!mockTest) return;
    if (duration <= 0) { message.error('Vui lòng nhập thời gian hợp lệ'); return; }
    router.push(`/quiz-taking/${id}?type=MOCK_TEST&duration=${duration}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileTextOutlined className="text-3xl text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{mockTest?.examName || mockTest?.name}</h2>
            <p className="text-sm text-gray-600">{mockTest?.description}</p>
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <Text className="block text-sm text-gray-500">Số câu</Text>
            <div className="text-lg font-bold">{mockTest?.totalQuestions || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <Text className="block text-sm text-gray-500">Thời gian mặc định (phút)</Text>
            <div className="text-lg font-bold">{mockTest?.durationMinutes || 60}</div>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text strong className="block mb-3 text-base">⏱️ Tùy chỉnh thời gian làm bài</Text>
          <InputNumber min={1} max={300} value={duration} onChange={(v) => setDuration(v || 0)} style={{ width: '100%' }} size="large" />
        </div>

        <div className="mt-4 text-right">
          <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={handleStart}>Bắt đầu làm bài</Button>
        </div>
      </Card>

      {/* Comments */}
      <CommentList quizId={id} />
    </div>
  );
}
