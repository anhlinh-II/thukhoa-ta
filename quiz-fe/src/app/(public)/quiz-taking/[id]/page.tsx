"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Spin, Button, Radio, Space, message, Modal, Switch, Input, Popover } from "antd";
import VocabProvider from '@/share/components/VocabProvider';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ClockCircleOutlined, CheckCircleOutlined, HighlightOutlined, UnderlineOutlined, StrikethroughOutlined, DeleteOutlined, EditOutlined, FlagOutlined } from "@ant-design/icons";
import { quizMockTestService } from "@/share/services/quiz_mock_test/quiz-mocktest.service";
import { userQuestionAnswerService } from '@/share/services/user_question_answer/user-question-answer.service';
import { ENV } from "@/share/utils/env";

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  const [timeLeft, setTimeLeft] = useState(configDuration * 60); // Convert to seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#fef08a'); // Default yellow
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [noteText, setNoteText] = useState('');

  const highlightColors = [
    { name: 'yellow', color: '#fef08a', hover: '#fde047' },
    { name: 'orange', color: '#fed7aa', hover: '#fdba74' },
    { name: 'green', color: '#bbf7d0', hover: '#86efac' },
    { name: 'blue', color: '#bfdbfe', hover: '#93c5fd' },
    { name: 'pink', color: '#fbcfe8', hover: '#f9a8d4' },
  ];

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
        message.error('Không thể tải dữ liệu bài thi');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle text selection and highlighting
  useEffect(() => {
    if (!highlightMode) return;

    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      if (selectedText.length === 0) return;

      // Store selection for later use
      setSelectedText(selectedText);
      setSelectionRange(range.cloneRange());
      
      // Show color picker near selection
      const rect = range.getBoundingClientRect();
      setShowColorPicker(true);
      
      // Position the popover near the selection
      const popoverContainer = document.getElementById('color-picker-container');
      if (popoverContainer) {
        popoverContainer.style.position = 'fixed';
        popoverContainer.style.left = `${rect.left + rect.width / 2}px`;
        popoverContainer.style.top = `${rect.bottom + 10}px`;
        popoverContainer.style.transform = 'translateX(-50%)';
        popoverContainer.style.zIndex = '1000';
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [highlightMode]);

  const applyHighlight = (color: string, withNote: boolean = false) => {
    if (!selectionRange) return;

    // Create highlight span
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.className = 'cursor-pointer transition-colors px-0.5 rounded-sm';
    span.setAttribute('data-highlight', 'true');
    span.setAttribute('data-color', color);
    
    // Add hover effect
    span.onmouseenter = function(e: MouseEvent) {
      const element = e.currentTarget as HTMLSpanElement;
      const currentColor = element.getAttribute('data-color') || color;
      const hoverColor = highlightColors.find(c => c.color === currentColor)?.hover || color;
      element.style.backgroundColor = hoverColor;
    };
    span.onmouseleave = function(e: MouseEvent) {
      const element = e.currentTarget as HTMLSpanElement;
      const currentColor = element.getAttribute('data-color') || color;
      element.style.backgroundColor = currentColor;
    };
    
    if (withNote && noteText) {
      span.setAttribute('data-note', noteText);
      span.setAttribute('title', `Note: ${noteText}`);
      span.className += ' border-b-2 border-dashed border-blue-500 relative';
      
      // Add note icon
      const noteIcon = document.createElement('sup');
      noteIcon.innerHTML = '📝';
      noteIcon.className = 'text-xs ml-0.5';
      span.appendChild(noteIcon);
    }
    
    span.onclick = function(e: MouseEvent) {
      e.stopPropagation();
      const element = e.currentTarget as HTMLSpanElement;
      const note = element.getAttribute('data-note');
      
      if (note) {
        Modal.info({
          title: (
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              <span>Ghi chú của bạn</span>
            </div>
          ),
          content: (
            <div className="py-2">
              <Text>{note}</Text>
            </div>
          ),
          okText: 'Đóng',
          width: 400,
        });
      }
    };
    
    // Remove highlight on double click
    span.ondblclick = function(e: MouseEvent) {
      e.stopPropagation();
      const element = e.currentTarget as HTMLSpanElement;
      const hasNote = element.getAttribute('data-note');
      
      Modal.confirm({
        title: 'Xóa highlight?',
        content: hasNote ? 'Highlight này có ghi chú. Bạn có chắc muốn xóa?' : 'Bạn có chắc muốn xóa highlight này?',
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: () => {
          const parent = element.parentNode;
          while (element.firstChild) {
            parent?.insertBefore(element.firstChild, element);
          }
          parent?.removeChild(element);
        },
      });
    };

    try {
      selectionRange.surroundContents(span);
      window.getSelection()?.removeAllRanges();
    } catch (e) {
      console.log('Could not highlight across elements');
    }

    // Reset state
    setShowColorPicker(false);
    setSelectedText('');
    setSelectionRange(null);
    setNoteText('');
  };

  const toggleMark = (questionId: number) => {
    setMarks(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      const elapsedSeconds = Math.max(0, totalSeconds - timeLeft);
      const timeSpentMinutes = Math.ceil(elapsedSeconds / 60);

      const apiResp = await quizMockTestService.submit(quizId, payload, timeSpentMinutes);
      const res = apiResp;

      message.success('Đã nộp bài thành công!');
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

      message.error(userMessage);
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
    message.success('Đã xóa tất cả highlights');
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
      {/* Color Picker Popover */}
      {showColorPicker && (
        <div 
          id="color-picker-container"
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-fade-in"
          style={{ zIndex: 9999 }}
        >
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out;
            }
          `}</style>
          
          <div className="flex items-center gap-2 mb-3">
            {highlightColors.map((colorItem) => (
              <button
                key={colorItem.name}
                onClick={() => applyHighlight(colorItem.color)}
                className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all hover:scale-110"
                style={{ backgroundColor: colorItem.color }}
                title={`Highlight ${colorItem.name}`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                const note = prompt('Nhập ghi chú:');
                if (note) {
                  setNoteText(note);
                  applyHighlight(selectedColor, true);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700 transition-colors"
              title="Thêm ghi chú"
            >
              <EditOutlined />
              <span>Thêm note</span>
            </button>
            
            <button
              onClick={() => setShowColorPicker(false)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
              title="Đóng"
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>
      )}

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
          </div>
        </div>
      </div>

      <div className="pt-20 flex">
        {/* Left: Main Content */}
        <div className="flex-1 p-6 pr-0 overflow-y-auto">
          {/* VocabProvider wraps content to enable double-click lookup only on this page */}
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <div style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {/* We'll mount VocabProvider lazily to avoid adding global listeners unnecessarily */}
            <React.Suspense fallback={<div />}> 
              {/* @ts-ignore */}
              <VocabProvider>
                <div style={{ userSelect: highlightMode ? 'text' : 'auto', cursor: highlightMode ? 'text' : 'default' }}>
          <div className="max-w-4xl">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                        
                        <Radio.Group
                          value={answers[question.id]}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full"
                        >
                          <Space direction="vertical" className="w-full">
                            {question.options.map((option, optIndex) => (
                              <Radio 
                                key={option.id} 
                                value={option.id}
                                className="w-full p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-all"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold min-w-[24px]">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <div 
                                    className="flex-1 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: option.contentHtml }} 
                                  />
                                </div>
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
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
                        
                        <Radio.Group
                          value={answers[question.id]}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full"
                        >
                          <Space direction="vertical" className="w-full">
                            {question.options.map((option, optIndex) => (
                              <Radio 
                                key={option.id} 
                                value={option.id}
                                className="w-full p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-all"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="font-bold min-w-[24px]">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <div 
                                    className="flex-1 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: option.contentHtml }} 
                                  />
                                </div>
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
                      </div>
                    );
                  })}
                </Card>
              )}
            </Space>
                </div>
              </div>
              </VocabProvider>
            </React.Suspense>
          </div>
        </div>

        {/* Right Sidebar: Timer & Question Navigator */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="sticky top-0">
            {/* Timer */}
            <Card className="mb-6 text-center" bordered={false}>
              <Text type="secondary" className="block mb-2">Thời gian còn lại</Text>
              <div className={`text-4xl font-bold mb-4 ${
                timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <Text type="secondary" className="text-sm block mb-4">
                Bắt đầu: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={handleSubmit}
                disabled={answeredCount === 0}
              >
                NỘP BÀI
              </Button>
              
              {/* Clear Highlights Button */}
              {highlightMode && (
                <Button
                  type="text"
                  size="small"
                  block
                  className="mt-2"
                  onClick={clearAllHighlights}
                >
                  Xóa tất cả highlights
                </Button>
              )}
            </Card>

            {/* Question Progress */}
            <Card title="Tiến độ làm bài" className="mb-4" bordered={false}>
              {highlightMode && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <Text className="text-xs text-yellow-800 block mb-1">
                    💡 <strong>Highlight:</strong> Bôi đen text → chọn màu
                  </Text>
                  <Text className="text-xs text-yellow-800 block mb-1">
                    📝 <strong>Note:</strong> Click "Thêm note" để ghi chú
                  </Text>
                  <Text className="text-xs text-yellow-800 block">
                    🗑️ <strong>Xóa:</strong> Double-click vào highlight
                  </Text>
                </div>
              )}
              
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
                    className={`h-10 rounded-md flex items-center justify-center text-sm font-semibold transition-all relative ${
                      answers[q.id]
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
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <Text type="secondary">Đã làm</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                    <Text type="secondary">Chưa làm</Text>
                  </div>
                  <div className="flex items-center gap-2">
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
