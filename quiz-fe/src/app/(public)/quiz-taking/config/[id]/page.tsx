"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { quizMockTestService } from '@/share/services/quiz_mock_test/quiz-mocktest.service';
import { Card, Typography, Divider, InputNumber, Button, message, Breadcrumb, Tag, Space, Progress, Row, Col } from 'antd';
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
        setDuration(Number(view?.durationMinutes) || 60);
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
    <div className="max-w-6xl mx-auto p-6 my-6">
      {/* Banner */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'linear-gradient(90deg,#e6f7ff, #fff)', border: '1px solid #e6f7ff' }}>
        <Breadcrumb separator=">" className="mb-3">
          <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item href="/programs">Chương trình</Breadcrumb.Item>
          <Breadcrumb.Item>Chi tiết đề</Breadcrumb.Item>
        </Breadcrumb>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <FileTextOutlined className="text-3xl text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{mockTest?.examName || mockTest?.name}</h1>
            <div className="text-sm text-gray-600 mt-1">{mockTest?.description}</div>
            <div className="mt-3">
              <Space size="middle">
                <Tag color="blue">{mockTest?.level || 'All Levels'}</Tag>
                <Tag color="gold">{mockTest?.category || 'Mock Test'}</Tag>
                <Tag color="default">{mockTest?.totalQuestions || 0} câu</Tag>
              </Space>
            </div>
          </div>
          <div>
            <Space direction="vertical" align="end">
              <div className="text-right text-sm text-gray-500">Thời gian mặc định</div>
              <div className="text-lg font-semibold">{mockTest?.durationMinutes || 60} phút</div>
            </Space>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <Row gutter={20}>
        <Col xs={24} lg={8}>
          <Card className="mb-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="text-gray-700 font-semibold">Chi tiết đề</div>
              <div className="flex gap-3">
                <div className="flex-1 text-sm text-gray-600">Số câu</div>
                <div className="font-bold">{mockTest?.totalQuestions || 0}</div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 text-sm text-gray-600">Thời gian mặc định</div>
                <div className="font-bold">{mockTest?.durationMinutes || 60} phút</div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 text-sm text-gray-600">Độ khó</div>
                <div className="font-bold">{mockTest?.difficulty || 'Trung bình'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Tiến độ đề mẫu</div>
                <Progress percent={Math.min(100, (mockTest?.progressPercent || 0))} status="active" />
              </div>

              <Divider />
              <div className="text-sm text-gray-600">Mẹo</div>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Đọc kỹ yêu cầu và quản lý thời gian.</li>
                <li>Bắt đầu với các câu dễ để tích điểm nhanh.</li>
                <li>Đánh dấu câu nghi ngờ để quay lại.</li>
              </ul>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-4">
                  <div className="text-base font-medium">⏱️ Tùy chỉnh thời gian làm bài</div>
                  <div className="text-sm text-gray-500">Bạn có thể thay đổi thời gian theo nhu cầu.</div>
                </div>

                <InputNumber min={1} max={300} value={duration} onChange={(v) => setDuration(v || 0)} style={{ width: '220px' }} size="large" />
              </div>

              <div className="ml-auto">
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={handleStart}>Bắt đầu làm bài</Button>
              </div>
            </div>
          </Card>

          {/* Comments */}
          <div className="bg-white rounded-lg shadow-sm p-2">
            <CommentList quizId={id} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
