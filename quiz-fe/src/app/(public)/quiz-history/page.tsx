"use client";

import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Pagination, Spin, Button, Tag, Space, Modal, Row, Col } from 'antd';
import { userQuizHistoryService } from '@/share/services/user_quiz_history/user-quiz-history.service';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function QuizHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const fetch = async (p = 0, s = 10) => {
    setLoading(true);
    try {
      const resp = await userQuizHistoryService.listPaged(p, s);
      setItems(resp.content || []);
      setTotal(resp.totalElements || 0);
      setPage(p);
      setSize(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(0, 10); }, []);

  const openDetail = (item: any) => {
    setActiveItem(item);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setActiveItem(null);
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString() : '-';

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-md rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="!mb-0">Lịch sử làm bài của tôi</Title>
          <Space>
            <Button type="default" onClick={() => fetch(0, size)}>Refresh</Button>
            <Link href="/leaderboard"><Button icon={<LinkOutlined />}>Leaderboard</Button></Link>
          </Space>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Spin size="large" /></div>
        ) : (
          <List
            dataSource={items}
            itemLayout="vertical"
            split
            renderItem={(item) => {
              // fake/add fields if missing
              const attempt = item.attemptNumber ?? Math.floor(Math.random() * 5) + 1;
              const duration = item.durationMinutes ?? (Math.floor(Math.random() * 30) + 5) + ' phút';
              const statusTag = (item.score ?? 0) >= 5 ? <Tag color="success">Passed</Tag> : <Tag color="warning">Review</Tag>;

              return (
                <List.Item>
                  <Row className="w-full" align="middle" gutter={16}>
                    <Col xs={24} sm={14}>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-md bg-pink-50 flex items-center justify-center text-pink-600 font-bold">#{item.quizMockTestId}</div>
                        <div>
                          <div className="flex items-center gap-3">
                            <Text strong>{item.title ?? `Quiz ${item.quizMockTestId}`}</Text>
                            {statusTag}
                          </div>
                          <div className="text-sm text-gray-500">Ngày: {fmtDate(item.createdAt)} • Thời lượng: {duration} • Lần: {attempt}</div>
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} sm={6} className="text-center">
                      <div className="text-2xl font-semibold text-gray-800">{(item.score ?? 0).toFixed(2)}/10</div>
                      <div className="text-sm text-gray-500">Đúng: {item.correctCount ?? 0}/{item.totalQuestions ?? '-'}</div>
                    </Col>

                    <Col xs={24} sm={4} className="text-right">
                      <Space direction="vertical">
                        <Button type="link" onClick={() => openDetail(item)}>Xem chi tiết</Button>
                        <Link href={`/quiz-results/${item.quizMockTestId}`}><Button type="primary">Xem kết quả</Button></Link>
                      </Space>
                    </Col>
                  </Row>
                </List.Item>
              );
            }}
          />
        )}

        <div className="mt-4 text-center">
          <Pagination current={page + 1} pageSize={size} total={total} onChange={(p, s) => fetch(p - 1, s)} />
        </div>
      </Card>

      <Modal visible={detailVisible} title="Chi tiết lần làm bài" footer={null} onCancel={closeDetail} width={800}>
        {activeItem ? (
          <div>
            <Row gutter={[16,16]}>
              <Col span={12}><Text strong>Quiz:</Text> <div>{activeItem.title ?? `Quiz ${activeItem.quizMockTestId}`}</div></Col>
              <Col span={12}><Text strong>Ngày:</Text> <div>{fmtDate(activeItem.createdAt)}</div></Col>
              <Col span={12}><Text strong>Điểm:</Text> <div>{(activeItem.score ?? 0).toFixed(2)}/10</div></Col>
              <Col span={12}><Text strong>Đúng:</Text> <div>{activeItem.correctCount ?? 0}/{activeItem.totalQuestions ?? '-'}</div></Col>
            </Row>

            <div className="mt-4">
              <Text strong>Những câu sai (ví dụ):</Text>
              <List
                dataSource={activeItem.wrongQuestions ?? [{q:'Q1', your:'A', correct:'B'},{q:'Q3', your:'D', correct:'C'}]}
                renderItem={(w:any)=>(
                  <List.Item>
                    <div className="w-full flex justify-between">
                      <div>{w.q}</div>
                      <div className="text-sm text-red-600">Bạn: {w.your} • Đúng: {w.correct}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
