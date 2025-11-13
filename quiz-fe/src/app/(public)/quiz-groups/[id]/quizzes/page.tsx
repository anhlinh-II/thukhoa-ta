"use client";

import React, { useState, useEffect } from "react";
import { Card, List, Typography, Spin, Button, Tag } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ClockCircleOutlined, FileTextOutlined, TrophyOutlined } from "@ant-design/icons";
import { QuizMockTestResponse } from "@/share/services/quiz_mock_test/model";
import { quizMockTestService } from "@/share/services/quiz_mock_test/quizMockTestService";

const { Title, Text } = Typography;

const QuizGroupQuizzesPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const quizGroupId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizMockTestResponse[]>([]);
  const [groupName, setGroupName] = useState<string>("");

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Fetch quiz mock tests filtered by quizGroup
      const request = {
        skip: 0,
        take: 100,
        filter: JSON.stringify([
          {
            field: "quizGroup",
            operator: "EQUALS",
            value: Number(quizGroupId),
            dataType: "NUMBER"
          }
        ]),
        sort: "displayOrder asc",
      };

      const response = await quizMockTestService.getViewsPagedWithFilter(request);
      const quizList = response.data as any as QuizMockTestResponse[];

      console.log('Quizzes data:', quizList);
      setQuizzes(quizList);

      // Get group name from first quiz if available
      if (quizList.length > 0 && quizList[0].groupName) {
        setGroupName(quizList[0].groupName);
      } else {
        setGroupName(`Nhóm #${quizGroupId}`);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizGroupId) {
      fetchQuizzes();
    }
  }, [quizGroupId]);

  const handleStartQuiz = (quizId: number | string) => {
    // Navigate to quiz taking page
    router.push(`/quiz/${quizId}/start`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Quay lại
          </Button>
          <Title level={2} className="!m-0">
            {groupName}
          </Title>
          <Text type="secondary" className="text-base">
            Danh sách các bài thi trong nhóm
          </Text>
        </div>

        {loading ? (
          <div className="w-full text-center py-12">
            <Spin size="large" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Text type="secondary">Chưa có bài thi nào trong nhóm này</Text>
            </div>
          </Card>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
            dataSource={quizzes}
            renderItem={(quiz) => (
              <List.Item>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Button
                      key="start"
                      type="primary"
                      block
                      size="large"
                      onClick={() => handleStartQuiz(quiz.id)}
                    >
                      Bắt đầu làm bài
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="space-y-2">
                        <Title level={4} className="!mb-0" style={{ fontSize: '18px' }}>
                          {quiz.title}
                        </Title>
                        {quiz.examName && (
                          <Tag color="blue">{quiz.examName}</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div className="space-y-3 mt-3">
                        {quiz.description && (
                          <Text type="secondary" className="block text-sm">
                            {quiz.description}
                          </Text>
                        )}

                        <div className="space-y-2">
                          {quiz.durationMinutes && (
                            <div className="flex items-center gap-2 text-sm">
                              <ClockCircleOutlined className="text-blue-500" />
                              <span>{quiz.durationMinutes} phút</span>
                            </div>
                          )}

                          {quiz.totalQuestions && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileTextOutlined className="text-green-500" />
                              <span>{quiz.totalQuestions} câu hỏi</span>
                            </div>
                          )}
                        </div>

                        {quiz.isActive === 'false' && (
                          <Tag color="red">Không hoạt động</Tag>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default QuizGroupQuizzesPage;
