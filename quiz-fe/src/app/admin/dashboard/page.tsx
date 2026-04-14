"use client";
import { Card, Statistic, Row, Col } from 'antd';
import { QuestionCircleOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to the Quiz Management Dashboard</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Quiz Groups"
              value={12}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Programs"
              value={8}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <Card title="Quick Actions" className="w-full">
          <p className="text-gray-500">Dashboard functionality coming soon...</p>
        </Card>
      </div>
    </div>
  );
}
