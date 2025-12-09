"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, Typography, Spin, Button, Modal, Switch } from "antd";
import messageService from '@/share/services/messageService';
import VocabProvider from '@/share/components/VocabProvider';
import TextHighlighter from '@/share/components/TextHighlighter';
import QuizTimer from '@/share/components/QuizTimer';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { HighlightOutlined, FlagOutlined } from "@ant-design/icons";
import AIHelper from '@/share/components/AIHelper';
import { quizMockTestService } from "@/share/services/quiz_mock_test/quiz-mocktest.service";
import { userQuestionAnswerService } from '@/share/services/user_question_answer/user-question-answer.service';
import { ENV } from "@/share/utils/env";

const { Title, Text } = Typography;

interface Question {
  id: number;
  contentHtml: string;
  score: number;
  options: Array<{
    id: number;
    contentHtml: string;
    isCorrect: boolean;
  }>;
}

interface QuestionGroup {
  id: number;
  title: string;
  contentHtml?: string;
  questions: Question[];
}

interface QuizPreviewData {
  quiz: {
    id: number;
    examName: string;
    durationMinutes: number;
  };
  totalQuestions: number;
  questionGroups: QuestionGroup[];
  standaloneQuestions: Question[];
}

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const quizId = params.id as string;
  const quizType = searchParams.get('type') || 'MOCK_TEST';
  const configDuration = parseInt(searchParams.get('duration') || '60', 10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizData, setQuizData] = useState<QuizPreviewData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marks, setMarks] = useState<Record<number, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  const timeLeftRef = useRef(configDuration * 60);

  // Fetch quiz questions (giống preview ở admin)
  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${ENV.API_URL}/quiz-mock-tests/${quizId}/preview`);
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error('Failed to load quiz data', error);
        messageService.error('Không thể tải dữ liệu bài thi');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const toggleMark = (questionId: number) => {
    setMarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    // Close confirmation modal immediately to avoid it lingering
    setShowSubmitModal(false);
    try {
      setSubmitting(true);
      // const payload = Object.fromEntries(Object.entries(answers).map(([k, v]) => [Number(k), v]));
      const payload = Object.fromEntries(Object.entries(answers).map(([k, v]) => [Number(k), v]));

      // compute elapsed seconds and timeSpent in minutes
      const totalSeconds = configDuration * 60;
      const elapsedSeconds = Math.max(0, totalSeconds - timeLeftRef.current);
      const timeSpentMinutes = Math.ceil(elapsedSeconds / 60);

      const apiResp = await quizMockTestService.submit(quizId, payload, timeSpentMinutes);
      const res = apiResp;

      messageService.success('Đã nộp bài thành công!');
      // Persist result for results page and redirect there
      try {
        sessionStorage.setItem(`quizResult:${quizId}`, JSON.stringify(res));
      } catch (e) {
        // ignore storage errors
      }

      // Save per-question answers to backend (user_question_answer)
      try {
        const quizHisId: number | undefined = res?.quizHisId;
        // If backend already persisted the quiz history and per-question answers (quizHisId present), skip FE creates
        if (quizHisId) {
          console.debug('Backend persisted quiz history (id=' + quizHisId + '), skipping FE per-question creates.');
        } else {
          // If backend didn't persist, create per-question answers from returned answers or fallback
          const returnedAnswers: Array<any> | undefined = res?.answers;
          if (Array.isArray(returnedAnswers) && returnedAnswers.length > 0) {
            const createPromises = returnedAnswers.map((a: any) => {
              const req = {
                questionId: a.questionId,
                questionOptionId: a.yourOptionId,
                timeSpent: 0,
                isCorrect: a.isCorrect,
              } as any;
              return userQuestionAnswerService.createAnswer(req).catch(err => {
                console.debug('Failed to save user question answer', err);
              });
            });
            await Promise.allSettled(createPromises);
          } else {
            // fallback: use local answers map to create entries without correctness
            const createPromises = Object.entries(payload).map(([qId, optId]) => {
              const req = {
                questionId: Number(qId),
                questionOptionId: optId,
                timeSpent: 0,
              } as any;
              return userQuestionAnswerService.createAnswer(req).catch(err => {
                console.debug('Failed to save user question answer (fallback)', err);
              });
            });
            await Promise.allSettled(createPromises);
          }
        }
      } catch (e) {
        console.debug('Error saving per-question answers', e);
      }

      router.push(`/quiz-results/${quizId}`);
    } catch (err: any) {
      console.error('Submit error:', err);
      // Prefer server-provided message when available
      let userMessage = 'Gửi kết quả thất bại. Vui lòng thử lại.';
      if (err?.message) {
        userMessage = err.message;
      }
      // Axios-like error object may contain response.data
      if (err?.response?.data) {
        try {
          const data = err.response.data;
          if (data.message) userMessage = data.message + (data.code ? ` (code=${data.code})` : '');
          else userMessage = JSON.stringify(data);
        } catch (e) {
          // ignore
        }
      }

      messageService.error(userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAllHighlights = () => {
    const highlights = document.querySelectorAll('[data-highlight="true"]');
    highlights.forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent?.insertBefore(span.firstChild, span);
      }
      parent?.removeChild(span);
    });
    messageService.success('Đã xóa tất cả highlights');
  };

  const getAllQuestions = (): Question[] => {
    if (!quizData) return [];

    const groupQuestions = quizData.questionGroups.flatMap(g => g.questions);
    const standalone = quizData.standaloneQuestions || [];

    return [...groupQuestions, ...standalone];
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = getAllQuestions().length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải bài thi..." />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <Text type="secondary">Không tìm thấy dữ liệu bài thi</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <Title level={4} className="!m-0">{quizData.quiz.examName}</Title>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <HighlightOutlined className={highlightMode ? 'text-yellow-500' : 'text-gray-400'} />
              <Text type="secondary" className="text-sm mr-2">Highlight</Text>
              <Switch
                checked={highlightMode}
                onChange={setHighlightMode}
                size="small"
              />
            </div>
            <Button
              type="default"
              onClick={() => router.back()}
            >
              Thoát
            </Button>
            <AIHelper selectedText={selectedText} />
          </div>
        </div>
      </div>

      <div className="pt-20 flex">
        {/* Left: Main Content - centered */}
        <div className="flex-1 p-6 overflow-y-auto flex justify-center" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="w-full max-w-4xl">
            <React.Suspense fallback={<div />}>
              <TextHighlighter enabled={highlightMode}>
                <VocabProvider disabled={highlightMode}>
                  <div className="space-y-6">
                    {/* Question Groups */}
                    {quizData.questionGroups.map((group, groupIndex) => (
                      <Card key={group.id} className="shadow-sm">
                        <Title level={5} className="!mb-4">{group.title}</Title>

                        {group.contentHtml && (
                          <div
                            className="mb-6 p-4 bg-gray-50 rounded border border-gray-200"
                            dangerouslySetInnerHTML={{ __html: group.contentHtml }}
                          />
                        )}

                        {group.questions.map((question, qIndex) => {
                          const questionNumber = quizData.questionGroups
                            .slice(0, groupIndex)
                            .reduce((sum, g) => sum + g.questions.length, 0) + qIndex + 1;

                          return (
                            <div
                              key={question.id}
                              id={`question-${question.id}`}
                              className="mb-6 scroll-mt-24"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <Text strong className="text-base">Câu {questionNumber}</Text>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="text"
                                    size="small"
                                    onClick={() => toggleMark(question.id)}
                                    title={marks[question.id] ? 'Bỏ đánh dấu chưa chắc chắn' : 'Đánh dấu chưa chắc chắn'}
                                    className="!p-0"
                                  >
                                      <FlagOutlined style={{ color: marks[question.id] ? '#f5222d' : '#9aa0a6' }} />
                                    </Button>
                                  </div>
                                </div>

                                <div
                                  className="mb-4 prose max-w-none"
                                  dangerouslySetInnerHTML={{ __html: question.contentHtml }}
                                />

                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => {
                                    const isSelected = answers[question.id] === option.id;
                                    return (
                                      <div
                                        key={option.id}
                                        onClick={() => handleAnswerChange(question.id, option.id)}
                                        className={`w-full p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                          isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <span className={`font-bold min-w-[24px] ${
                                            isSelected ? 'text-blue-600' : 'text-gray-600'
                                          }`}>
                                            {String.fromCharCode(65 + optIndex)}.
                                          </span>
                                          <div
                                            className="flex-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: option.contentHtml }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </Card>
                      ))}

                      {/* Standalone Questions */}
                      {quizData.standaloneQuestions && quizData.standaloneQuestions.length > 0 && (
                        <Card className="shadow-sm">
                          <Title level={5} className="!mb-4">Câu hỏi độc lập</Title>

                          {quizData.standaloneQuestions.map((question, qIndex) => {
                            const questionNumber = quizData.questionGroups.reduce(
                              (sum, g) => sum + g.questions.length,
                              0
                            ) + qIndex + 1;

                            return (
                              <div
                                key={question.id}
                                id={`question-${question.id}`}
                                className="mb-6 scroll-mt-24"
                              >
                                <div className="mb-3">
                                  <Text strong className="text-base">Câu {questionNumber}</Text>
                                </div>

                                <div
                                  className="mb-4 prose max-w-none"
                                  dangerouslySetInnerHTML={{ __html: question.contentHtml }}
                                />

                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => {
                                    const isSelected = answers[question.id] === option.id;
                                    return (
                                      <div
                                        key={option.id}
                                        onClick={() => handleAnswerChange(question.id, option.id)}
                                        className={`w-full p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                          isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <span className={`font-bold min-w-[24px] ${
                                            isSelected ? 'text-blue-600' : 'text-gray-600'
                                          }`}>
                                            {String.fromCharCode(65 + optIndex)}.
                                          </span>
                                          <div
                                            className="flex-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: option.contentHtml }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </Card>
                      )}
                    </div>
                </VocabProvider>
              </TextHighlighter>
              </React.Suspense>
            </div>
          </div>

        {/* Right Sidebar: Timer & Question Navigator */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="sticky top-0">
            {/* Timer */}
            <QuizTimer
              initialSeconds={configDuration * 60}
              onTimeUp={handleSubmit}
              onSubmit={handleSubmit}
              answeredCount={answeredCount}
              totalQuestions={totalQuestions}
              highlightMode={highlightMode}
              onClearHighlights={clearAllHighlights}
              timeLeftRef={timeLeftRef}
            />

            {/* Question Progress */}
            <Card title="Tiến độ làm bài" className="mb-4" bordered={false}>

              <div className="text-center mb-4">
                <Text className="text-2xl font-bold text-green-600">{answeredCount}</Text>
                <Text className="text-gray-400 mx-2">/</Text>
                <Text className="text-2xl font-bold text-gray-600">{totalQuestions}</Text>
                <Text type="secondary" className="block text-sm mt-1">
                  câu đã hoàn thành
                </Text>
              </div>

              {/* Question Grid Navigator */}
              <div className="mb-4">
                <Text type="secondary" className="text-xs block mb-2">
                  Tip: Click số câu để di chuyển
                </Text>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {getAllQuestions().map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      const element = document.getElementById(`question-${q.id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`h-10 rounded-md flex items-center justify-center text-sm font-semibold transition-all relative ${answers[q.id]
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                        : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                    {marks[q.id] && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">
                        !
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-around text-xs">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <Text type="secondary">Đã làm</Text>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                    <Text type="secondary">Chưa làm</Text>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <Text type="secondary">Đã đánh dấu</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Xác nhận nộp bài"
        open={showSubmitModal}
        onOk={confirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        okText="Xác nhận nộp bài"
        cancelText="Tiếp tục làm bài"
      >
        <div className="space-y-3">
          <Text>Bạn đã làm <strong>{answeredCount}/{totalQuestions}</strong> câu hỏi.</Text>
          {answeredCount < totalQuestions && (
            <Text type="warning" className="block">
              Còn <strong>{totalQuestions - answeredCount}</strong> câu chưa trả lời!
            </Text>
          )}
          <Text className="block">Bạn có chắc chắn muốn nộp bài không?</Text>
        </div>
      </Modal>
    </div>
  );
}
