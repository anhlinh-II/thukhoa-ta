"use client";

import React, { useState } from "react";
import { Typography, Spin, Breadcrumb, Modal, InputNumber, message, Divider, Card } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { quizGroupService } from "@/share/services/quiz_group/quiz-group.service";
import { LoadingOutlined, FileTextOutlined, ClockCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useQuizMockTestsByGroup } from "@/share/hooks/useQuizMockTests";
import QuizCard from "./QuizCard";

const { Title, Text } = Typography;

export default function MockTestsListPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMockTest, setSelectedMockTest] = useState<any>(null);
  const [duration, setDuration] = useState<number>(0);
  const [groupName, setGroupName] = useState<string>('');
  const [programName, setProgramName] = useState<string>('');
  const [programIdNum, setProgramIdNum] = useState<number | null>(null);
  const searchParams = useSearchParams();

  // Fetch mock tests for this group
  const { data: mockTests, isLoading } = useQuizMockTestsByGroup(groupId, true);

  // Initialize group/program name from query params if provided, otherwise fetch view
  React.useEffect(() => {
    if (!groupId) return;
    const qGroup = searchParams?.get('groupName');
    const qProgram = searchParams?.get('programName');
    const qProgramId = searchParams?.get('programId');

    if (qGroup) setGroupName(qGroup);
    if (qProgram) setProgramName(qProgram);
    if (qProgramId) setProgramIdNum(Number(qProgramId));

    if (qGroup && qProgram) {
      // both provided, no need to fetch
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const view: any = await quizGroupService.getViewById(groupId);
        if (!mounted) return;
        setGroupName(prev => prev || view?.name || `Nhóm ${groupId}`);
        setProgramName(prev => prev || view?.programName || 'Chương trình');
        if (view?.programId) setProgramIdNum(Number(view.programId));
      } catch (e) {
        console.error('Failed to load group view', e);
      }
    })();
    return () => { mounted = false; };
  }, [groupId, searchParams]);

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
          <Breadcrumb className="mb-4 cursor-pointer">
            <Breadcrumb.Item onClick={() => router.push('/')}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item
              onClick={() => programIdNum ? router.push(`/programs/${programIdNum}/quiz-groups`) : router.push('/programs')}
            >
              {programName}
            </Breadcrumb.Item>
            <Breadcrumb.Item>{groupName || `Nhóm ${groupId}`}</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {isLoading ? (
          <div className="w-full text-center py-20">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <Text type="secondary" className="block mt-4">Đang tải danh sách bài thi...</Text>
          </div>
        ) : mockTests && mockTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTests.map((mockTest: any, index: number) => (
              <QuizCard key={mockTest.id} mockTest={mockTest} index={index} onStart={handleStartQuiz} />
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
