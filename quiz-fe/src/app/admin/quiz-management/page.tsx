"use client";

import React from 'react';
import Link from 'next/link';
import { Card, Row, Col, Button, Avatar } from 'antd';
import { FileTextOutlined, AppstoreOutlined, TagsOutlined, RightOutlined } from '@ant-design/icons';

const { Meta } = Card;

export default function QuizManagementLanding() {
  const cards = [
    {
      key: 'mocktests',
      title: 'Bài thi thử',
      desc: 'Manage full mock-test quizzes: create, edit, preview and publish.',
      href: '/admin/quiz-management/quiz-mocktests',
      icon: <FileTextOutlined />,
    },
    {
      key: 'formats',
      title: 'Dạng bài thi',
      desc: 'Manage quizzes organized by format (e.g., multiple choice, cloze).',
      href: '/admin/quiz-management/quiz-formats',
      icon: <AppstoreOutlined />,
    },
    {
      key: 'topics',
      title: 'Chủ đề',
      desc: 'Manage quizzes grouped by topic/subject area.',
      href: '/admin/quiz-management/quiz-topics',
      icon: <TagsOutlined />,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Quản lý bài Quiz</h2>

      <Row gutter={[24, 24]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} lg={8}>
            <Link href={c.href} className="block">
              <Card hoverable bodyStyle={{ padding: 20 }} style={{ borderRadius: 8 }}>
                <Meta
                  avatar={<Avatar size={56} style={{ backgroundColor: '#000' }}>{c.icon}</Avatar>}
                  title={<span className="text-lg font-medium">{c.title}</span>}
                  description={<div className="text-sm text-gray-600 mt-2">{c.desc}</div>}
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
