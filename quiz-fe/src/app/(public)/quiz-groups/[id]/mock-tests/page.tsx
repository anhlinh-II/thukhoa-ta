"use client";

import React, { useState } from "react";
import { Card, Typography, Spin, Button, List, Modal, InputNumber, message, Tag, Divider } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ClockCircleOutlined, FileTextOutlined, LoadingOutlined, TrophyOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useQuizMockTestsByGroup } from "@/share/hooks/useQuizMockTests";

const { Title, Text } = Typography;

export default function MockTestsListPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMockTest, setSelectedMockTest] = useState<any>(null);
  const [duration, setDuration] = useState<number>(0);

  // Fetch mock tests for this group
  const { data: mockTests, isLoading } = useQuizMockTestsByGroup(groupId, true);

  const handleStartQuiz = (mockTest: any) => {
    setSelectedMockTest(mockTest);
    setDuration(mockTest.durationMinutes || 60);
    setShowConfigModal(true);
  };

  const handleConfirmStart = () => {
    if (!selectedMockTest) return;

    if (duration <= 0) {
      message.error('Vui lòng nhập thời gian hợp lệ');
      return;
    }

    setShowConfigModal(false);

    // Navigate to quiz taking page with config
    router.push(`/quiz-taking/${selectedMockTest.id}?type=MOCK_TEST&duration=${duration}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 hover:scale-105 transition-transform"
            size="large"
          >
            ← Quay lại
          </Button>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrophyOutlined className="text-2xl text-white" />
              </div>
              <Title level={2} className="!m-0 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Danh sách bài thi thử
              </Title>
            </div>
            <Text type="secondary" className="text-base ml-15">
              Chọn bài thi phù hợp để bắt đầu luyện tập và nâng cao kỹ năng của bạn
            </Text>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full text-center py-20">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <Text type="secondary" className="block mt-4">Đang tải danh sách bài thi...</Text>
          </div>
        ) : mockTests && mockTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTests.map((mockTest: any, index: number) => (
              <Card
                key={mockTest.id}
                hoverable
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-0 hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header with Number Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                          <Text className="text-white font-bold text-sm">#{index + 1}</Text>
                        </div>
                        <Tag color="gold" className="font-semibold">
                          <TrophyOutlined /> Mock Test
                        </Tag>
                      </div>
                      <Title level={4} className="!text-white !mb-2 !mt-0 line-clamp-2">
                        {mockTest.examName || mockTest.name}
                      </Title>
                    </div>
                  </div>

                  {/* Description */}
                  {mockTest.description && (
                    <Text className="text-white/90 text-sm block mb-4 line-clamp-2">
                      {mockTest.description}
                    </Text>
                  )}

                  <Divider className="!bg-white/20 !my-4" />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                      <FileTextOutlined className="text-2xl text-white mb-1" />
                      <div className="text-white font-bold text-lg">
                        {mockTest.totalQuestions || 0}
                      </div>
                      <Text className="text-white/80 text-xs">Câu hỏi</Text>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                      <ClockCircleOutlined className="text-2xl text-white mb-1" />
                      <div className="text-white font-bold text-lg">
                        {mockTest.durationMinutes || 60}
                      </div>
                      <Text className="text-white/80 text-xs">Phút</Text>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleStartQuiz(mockTest)}
                    className="!bg-white !text-purple-600 hover:!bg-purple-50 !border-0 !h-12 !font-semibold !rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Bắt đầu làm bài
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Card className="max-w-md mx-auto shadow-lg rounded-2xl border-0">
              <div className="py-8">
                <FileTextOutlined className="text-6xl text-gray-300 mb-4" />
                <Title level={4} className="text-gray-400">Chưa có bài thi nào</Title>
                <Text type="secondary">Vui lòng quay lại sau hoặc chọn nhóm khác</Text>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Config Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <ClockCircleOutlined className="text-white text-xl" />
            </div>
            <span className="text-xl font-semibold">Cấu hình thời gian làm bài</span>
          </div>
        }
        open={showConfigModal}
        onOk={handleConfirmStart}
        onCancel={() => setShowConfigModal(false)}
        okText="Bắt đầu làm bài"
        cancelText="Hủy"
        width={500}
        okButtonProps={{
          size: 'large',
          icon: <PlayCircleOutlined />,
        }}
        cancelButtonProps={{
          size: 'large',
        }}
      >
        {selectedMockTest && (
          <div className="py-4">
            <Card className="mb-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileTextOutlined className="text-purple-600 text-lg mt-1" />
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">Bài thi</Text>
                    <Text strong className="text-base">{selectedMockTest.examName || selectedMockTest.name}</Text>
                  </div>
                </div>

                <Divider className="!my-3" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <FileTextOutlined className="text-2xl text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{selectedMockTest.totalQuestions || 0}</div>
                    <Text type="secondary" className="text-xs">Câu hỏi</Text>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <ClockCircleOutlined className="text-2xl text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{selectedMockTest.durationMinutes || 60}</div>
                    <Text type="secondary" className="text-xs">Phút (mặc định)</Text>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text strong className="block mb-3 text-base">⏱️ Tùy chỉnh thời gian làm bài</Text>
              <InputNumber
                min={1}
                max={300}
                value={duration}
                onChange={(value) => setDuration(value || 0)}
                style={{ width: '100%' }}
                placeholder="Nhập thời gian (phút)"
                size="large"
                suffix="phút"
                className="rounded-lg"
              />
              <Text type="secondary" className="text-xs block mt-2">
                💡 Bạn có thể điều chỉnh thời gian phù hợp với nhu cầu luyện tập
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
