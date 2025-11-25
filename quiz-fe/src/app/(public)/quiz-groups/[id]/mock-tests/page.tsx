"use client";

import React, { useState } from "react";
import { Typography, Spin, Breadcrumb, message, Card } from "antd";
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

  // modal/config handled on dedicated page now
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
    // Navigate to a dedicated config + discussion page for this mock test
    router.push(`/quiz-taking/config/${mockTest.id}?groupId=${groupId}`);
  };

  // confirm start moved to config page

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

      {/* Config moved to dedicated page */}
    </div>
  );
}
