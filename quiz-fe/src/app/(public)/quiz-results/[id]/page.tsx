"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Typography, Row, Col, Statistic, Space, Divider } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  MinusCircleOutlined,
  FlagFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const quizId = params?.id;
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const key = `quizResult:${quizId}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch (e) {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [quizId]);

  if (!result) {
    return (
      <div className="p-6">
        <Card>
          <Title level={4}>Kết quả không tìm thấy</Title>
          <Text>Không tìm thấy kết quả trong phiên làm việc này. Có thể bạn vừa nộp bài ở thiết bị khác hoặc kết quả chưa được lưu.</Text>
          <div className="mt-4">
            <Button type="primary" onClick={() => router.push('/')}>Quay về trang chủ</Button>
          </div>
        </Card>
      </div>
    );
  }

  // derive stats
  const total = result.totalQuestions ?? (result.answers ? result.answers.length : 0);
  const correct = result.correctCount ?? (result.answers ? result.answers.filter((a: any) => a.isCorrect).length : 0);
  const answeredCount = result.answers ? result.answers.filter((a: any) => a.yourOptionId !== null && a.yourOptionId !== undefined).length : 0;
  const wrong = Math.max(0, answeredCount - correct);
  const skipped = Math.max(0, total - answeredCount);
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '-';
  const timeTaken = result.timeTaken ?? result.duration ?? null; // fallback keys

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Title level={3} className="m-0">Kết quả thi: {result.quizTitle ?? ''}</Title>
        </div>
        <Space>
          <Button type="primary">Xem đáp án</Button>
          <Button onClick={() => router.back()}>Quay về trang đề thi</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} lg={6}>
          <Card className="h-full">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Text strong>Kết quả làm bài</Text>
                  <Text>{answeredCount}/{total}</Text>
                </div>

                <Divider />

                <div className="flex items-center justify-between">
                  <Text>Độ chính xác (#đúng/#tổng)</Text>
                  <Text strong>{accuracy}%</Text>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Text>Thời gian hoàn thành</Text>
                    <Text>{timeTaken ?? '-'}</Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16} lg={18}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <CheckCircleFilled style={{ fontSize: 28, color: '#52c41a' }} />
                <div className="mt-2 text-green-600">Trả lời đúng</div>
                <div className="text-2xl font-semibold mt-2">{correct}</div>
                <div className="text-sm text-gray-500">câu hỏi</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <CloseCircleFilled style={{ fontSize: 28, color: '#ff4d4f' }} />
                <div className="mt-2 text-red-600">Trả lời sai</div>
                <div className="text-2xl font-semibold mt-2">{wrong}</div>
                <div className="text-sm text-gray-500">câu hỏi</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <MinusCircleOutlined style={{ fontSize: 28, color: '#9aa0a6' }} />
                <div className="mt-2 text-gray-600">Bỏ qua</div>
                <div className="text-2xl font-semibold mt-2">{skipped}</div>
                <div className="text-sm text-gray-500">câu hỏi</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <FlagFilled style={{ fontSize: 28, color: '#5973d8' }} />
                <div className="mt-2 text-indigo-600">Điểm</div>
                <div className="text-2xl font-semibold mt-2">{result.score ?? '-'}</div>
                <div className="text-sm text-gray-500">/10</div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Detail list */}
      {result.answers && result.answers.length > 0 && (
        <div className="mt-6">
          <Card title="Chi tiết các câu">
            <div className="grid grid-cols-1 gap-3">
              {result.answers.map((a: any, idx: number) => (
                <div key={idx} className="p-3 border rounded flex items-start justify-between">
                  <div>
                    <Text className="block">Câu {a.questionId}</Text>
                    <Text className="block text-sm text-gray-600">{a.isCorrect ? 'Đáp án đúng' : 'Sai'}</Text>
                    {a.explanationHtml && (
                      <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: a.explanationHtml }} />
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${a.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {a.isCorrect ? 'Đúng' : 'Sai'}
                    </div>
                    {!a.isCorrect && (
                      <div className="text-xs text-gray-500 mt-1">Đáp án đúng: {a.correctOptionId} — Bạn: {a.yourOptionId}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
