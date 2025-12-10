"use client";

import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Tag, Button, Collapse, Empty, Progress } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled, QuestionCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { userQuizHistoryService } from '@/share/services/user_quiz_history/user-quiz-history.service';
import { questionService } from '@/share/services/question/question.service';
import { questionOptionService } from '@/share/services/question_option/question-option.service';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface QuestionDetail {
  questionId: number;
  questionNo: number;
  correctOptionId: number | null;
  userOptionId: number | null;
  isCorrect: boolean | null;
}

interface HistoryDetail {
  id: number;
  quizMockTestId: number;
  totalQuestions: number;
  correctCount: number;
  questions: QuestionDetail[];
  isShowExplain: boolean;
}

export default function QuizHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = params.id as string;
  const quizName = searchParams.get('name') || '';

  const [loading, setLoading] = useState(true);
  const [historyDetail, setHistoryDetail] = useState<HistoryDetail | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (historyId) {
      loadData();
    }
  }, [historyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [detail, allQuestions, allOptions] = await Promise.all([
        userQuizHistoryService.getDetail(historyId),
        questionService.findAll(),
        questionOptionService.findAll(),
      ]);
      
      setHistoryDetail(detail);
      setQuestions(allQuestions || []);
      setOptions(allOptions || []);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = (id: number) => questions.find((q: any) => q.id === id);
  const getOptionsForQuestion = (questionId: number) => options.filter((o: any) => o.questionId === questionId);

  const score = historyDetail ? ((historyDetail.correctCount / historyDetail.totalQuestions) * 10).toFixed(2) : 0;
  const percentage = historyDetail ? Math.round((historyDetail.correctCount / historyDetail.totalQuestions) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!historyDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <Empty description="Không tìm thấy dữ liệu" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Card className="mb-4 shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-sky-600 -mx-6 -mt-6 px-6 py-6">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.back()}
              className="!text-white/80 hover:!text-white hover:!bg-white/10 !-ml-2 mb-3"
            >
              Quay lại
            </Button>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <Title level={4} className="!text-white !mb-1">Kết quả làm bài</Title>
                <Text className="!text-indigo-50 font-semibold text-4xl">{quizName || `#${historyDetail.quizMockTestId}`}</Text>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Progress
                    type="circle"
                    percent={percentage}
                    size={80}
                    strokeColor={{
                      '0%': '#10B981',
                      '100%': '#34D399',
                    }}
                    trailColor="rgba(255,255,255,0.2)"
                    format={() => (
                      <span className="text-white text-xl font-bold">{score}</span>
                    )}
                  />
                  <div className="text-indigo-100 mt-1 text-xs">Điểm số</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-3 text-center">
              <CheckCircleFilled className="text-2xl text-green-500 mb-1" />
              <div className="text-xl font-bold text-green-700">{historyDetail.correctCount}</div>
              <div className="text-xs text-green-600">Câu đúng</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-3 text-center">
              <CloseCircleFilled className="text-2xl text-red-500 mb-1" />
              <div className="text-xl font-bold text-red-700">{historyDetail.totalQuestions - historyDetail.correctCount}</div>
              <div className="text-xs text-red-600">Câu sai</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-3 text-center">
              <QuestionCircleOutlined className="text-2xl text-blue-500 mb-1" />
              <div className="text-xl font-bold text-blue-700">{historyDetail.totalQuestions}</div>
              <div className="text-xs text-blue-600">Tổng câu</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-3 text-center">
              <TrophyOutlined className="text-2xl text-amber-500 mb-1" />
              <div className="text-xl font-bold text-amber-700">{percentage}%</div>
              <div className="text-xs text-amber-600">Tỉ lệ đúng</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-lg rounded-2xl border-0">
          <div className="flex items-center justify-between mb-4">
            <Title level={5} className="!mb-0">Chi tiết từng câu hỏi</Title>
            <div className="flex gap-2">
              <Button 
                size="small" 
                onClick={() => setExpandedKeys(historyDetail.questions.map((_, i) => String(i)))}
              >
                Mở tất cả
              </Button>
              <Button 
                size="small" 
                onClick={() => setExpandedKeys([])}
              >
                Đóng tất cả
              </Button>
            </div>
          </div>

          <Collapse 
            activeKey={expandedKeys}
            onChange={(keys) => setExpandedKeys(keys as string[])}
            className="bg-transparent border-0 [&_.ant-collapse-header]:!items-center"
            expandIconPosition="end"
          >
            {historyDetail.questions.map((q, idx) => {
              const questionData = getQuestionById(q.questionId);
              const questionOptions = getOptionsForQuestion(q.questionId);
              const isCorrect = q.isCorrect;
              
              return (
                <Panel
                  key={String(idx)}
                  header={
                    <div className="flex items-center gap-4 py-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        isCorrect ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-rose-500'
                      }`}>
                        {q.questionNo || idx + 1}
                      </div>
                      <div className="flex-1">
                        <Text className="font-medium">Câu {q.questionNo || idx + 1}</Text>
                      </div>
                      {isCorrect ? (
                        <Tag color="success" className="!rounded-full !px-3">Đúng</Tag>
                      ) : (
                        <Tag color="error" className="!rounded-full !px-3">Sai</Tag>
                      )}
                    </div>
                  }
                  className="mb-3 !rounded-xl overflow-hidden border border-gray-100 !bg-white"
                >
                  {questionData ? (
                    <div className="space-y-4">
                      <div 
                        className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4"
                        dangerouslySetInnerHTML={{ __html: questionData.contentHtml || 'Không có nội dung' }} 
                      />
                      
                      <div className="space-y-2">
                        <Text strong className="text-gray-700">Các đáp án:</Text>
                        {questionOptions.map((opt: any) => {
                          const isUserChoice = q.userOptionId === opt.id;
                          const isCorrectAnswer = opt.isCorrect;
                          
                          let bgClass = 'bg-gray-50 border-gray-200';
                          let borderClass = '';
                          
                          if (isCorrectAnswer) {
                            bgClass = 'bg-green-50 border-green-300';
                            borderClass = 'ring-2 ring-green-200';
                          }
                          if (isUserChoice && !isCorrectAnswer) {
                            bgClass = 'bg-red-50 border-red-300';
                            borderClass = 'ring-2 ring-red-200';
                          }
                          
                          return (
                            <div 
                              key={opt.id}
                              className={`p-4 rounded-lg border ${bgClass} ${borderClass} transition-all`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div 
                                  className="flex-1 prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ __html: opt.contentHtml || 'Không có nội dung' }} 
                                />
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {isUserChoice && !isCorrectAnswer && (
                                    <Tag color="error" className="!m-0">
                                      Bạn chọn
                                    </Tag>
                                  )}
                                  {isCorrectAnswer && (
                                    <Tag color="success" className="!m-0">
                                      <CheckCircleFilled className="mr-1" />
                                      Đáp án đúng
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {historyDetail.isShowExplain && questionData.explanationHtml && (
                        <div className="mt-4">
                          <Text strong className="text-indigo-600 block mb-2">💡 Giải thích:</Text>
                          <div 
                            className="prose prose-sm max-w-none bg-indigo-50 rounded-lg p-4 border border-indigo-100"
                            dangerouslySetInnerHTML={{ __html: questionData.explanationHtml }} 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Empty description="Không tìm thấy dữ liệu câu hỏi" />
                  )}
                </Panel>
              );
            })}
          </Collapse>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            type="primary" 
            size="large"
            onClick={() => router.push(`/quiz-taking/${historyDetail.quizMockTestId}`)}
            className="!rounded-full !px-8 !h-12 !bg-gradient-to-r !from-indigo-500 !to-purple-600 hover:!from-indigo-600 hover:!to-purple-700 !border-0"
          >
            Làm lại bài quiz này
          </Button>
        </div>
      </div>
    </div>
  );
}
