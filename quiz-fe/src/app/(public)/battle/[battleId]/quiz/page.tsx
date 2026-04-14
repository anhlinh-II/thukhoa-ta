"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Button, Radio, Progress, Tag, Avatar, Spin } from "antd";
import messageService from '@/share/services/messageService';
import { TrophyOutlined, UserOutlined, WarningOutlined, LoadingOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useBattleWebSocket } from "@/share/hooks/useBattleWebSocket";
import { useAccount } from "@/share/hooks/useAuth";
import { useAntiCheat } from "@/share/hooks/useAntiCheat";
import { battleService } from "@/share/services/battle.service";

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

export default function BattleQuizPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = parseInt(params.battleId as string);
  const { data: user } = useAccount();
  
  const { connected, leaderboard, battleState, submitAnswer, reportTabSwitch, completeBattle, applyLocalScoreDelta } = useBattleWebSocket(
    battleId,
    user?.id || 0
  );

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizPreviewData | null>(null);
  // items can be group items or standalone questions
  const [items, setItems] = useState<any[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [groupQuestionIndex, setGroupQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [answeredResults, setAnsweredResults] = useState<Record<number, boolean>>({});
  const [localScoreDelta, setLocalScoreDelta] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [userCompleted, setUserCompleted] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Anti-cheat: report violations to server
  const handleAntiCheatViolation = useCallback((type: string, count: number) => {
    reportTabSwitch();
  }, [reportTabSwitch]);

  // Enable anti-cheat protection
  const { tabSwitchCount } = useAntiCheat({
    enabled: !userCompleted,
    onViolation: handleAntiCheatViolation,
    maxWarnings: 5,
  });

  // Fetch quiz questions from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const battle = await battleService.getBattle(battleId);
        if (!battle || !battle.quizId) {
          messageService.error('Không tìm thấy thông tin battle');
          return;
        }

        const preview = await battleService.getQuizPreview(battle.quizId);
        setQuizData(preview);

        // Build items: groups (with content and questions) followed by standalone questions
        const built: any[] = [];
        if (preview.questionGroups) {
          preview.questionGroups.forEach((group: any) => {
            built.push({ type: 'group', group });
          });
        }
        if (preview.standaloneQuestions) {
          preview.standaloneQuestions.forEach((q: any) => built.push({ type: 'single', question: q }));
        }
        setItems(built);
      } catch (error) {
        console.error('Failed to load quiz', error);
        messageService.error('Không thể tải câu hỏi');
      } finally {
        setLoading(false);
      }
    };

    if (battleId) {
      fetchQuiz();
    }
  }, [battleId]);

  const currentItem = items[currentItemIndex];

  // Timer applies for current question (single or group's current question); reset when current item changes
  useEffect(() => {
    setTimeLeft(60);
    startTimeRef.current = Date.now();
    if (!currentItem) return;
    // reset group index when item changes
    setGroupQuestionIndex(0);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // auto-submit when time runs out for current question
          handleSubmitSingle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentItemIndex, currentItem]);

  // submit for current question (single item or group's current question)
  const handleSubmitSingle = () => {
    if (!currentItem) return;
    const timeTaken = Date.now() - startTimeRef.current;

    if (currentItem.type === 'single') {
      const q = currentItem.question;
      const selected = selectedAnswers[q.id] ?? null;
      if (selected === null) {
        // messageService.error('Vui lòng chọn câu trả lời!');
        return;
      }

      submitAnswer({ questionId: q.id, answer: String(selected), timestamp: Date.now(), timeTaken });
      setAnsweredQuestions(prev => new Set(prev).add(q.id));

      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
        setTimeLeft(60);
        startTimeRef.current = Date.now();
      } else {
        completeBattle();
        setUserCompleted(true);
        messageService.success('Bạn đã hoàn thành! Đang chờ đối thủ...');
      }
    } else if (currentItem.type === 'group') {
      const group = currentItem.group;
      const question = group.questions[groupQuestionIndex];
      if (!question) return;
      const selected = selectedAnswers[question.id] ?? null;
      if (selected === null) {
        // messageService.error('Vui lòng chọn câu trả lời!');
        return;
      }

      submitAnswer({ questionId: question.id, answer: String(selected), timestamp: Date.now(), timeTaken });
      setAnsweredQuestions(prev => new Set(prev).add(question.id));

      if (groupQuestionIndex < group.questions.length - 1) {
        setGroupQuestionIndex(idx => idx + 1);
        setTimeLeft(60);
        startTimeRef.current = Date.now();
      } else {
        // finished this group, move to next item
        if (currentItemIndex < items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
          setTimeLeft(60);
          startTimeRef.current = Date.now();
        } else {
          completeBattle();
          setUserCompleted(true);
          messageService.success('Bạn đã hoàn thành! Đang chờ đối thủ...');
        }
      }
    }
  };

  // submit individual question (used for group questions)
  const submitQuestion = (question: any) => {
    const selected = selectedAnswers[question.id] ?? null;
    if (selected === null) {
      // messageService.error('Vui lòng chọn câu trả lời!');
      return;
    }
    const timeTaken = Date.now() - startTimeRef.current;
    submitAnswer({ questionId: question.id, answer: String(selected), timestamp: Date.now(), timeTaken });
    setAnsweredQuestions(prev => new Set(prev).add(question.id));
  };

  // handle selecting an option: evaluate immediately, update local score, submit to server and advance
  const handleSelectOption = (question: any, optionId: number, optionIsCorrect: boolean) => {
    if (showingResult) return;
    
    // record selection
    setSelectedAnswers(prev => ({ ...prev, [question.id]: optionId }));

    // mark answered and result
    setAnsweredQuestions(prev => new Set(prev).add(question.id));
    setAnsweredResults(prev => ({ ...prev, [question.id]: optionIsCorrect }));
    setLastAnswerCorrect(optionIsCorrect);
    setShowingResult(true);

    // optimistic score update for current user
    if (optionIsCorrect) {
      setLocalScoreDelta(prev => prev + (question.score || 1));
      // also update leaderboard immediately
      if (applyLocalScoreDelta) applyLocalScoreDelta(question.score || 1);
    }

    // submit to server
    const timeTaken = Date.now() - startTimeRef.current;
    submitAnswer({ questionId: question.id, answer: String(optionId), timestamp: Date.now(), timeTaken });

    // Delay before navigation to show result
    setTimeout(() => {
      setShowingResult(false);
      setLastAnswerCorrect(null);
      
      // navigation: advance depending on current item
      if (currentItem?.type === 'single') {
        if (currentItemIndex < items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
          setTimeLeft(60);
          startTimeRef.current = Date.now();
        } else {
          completeBattle();
          setUserCompleted(true);
          messageService.success('Bạn đã hoàn thành! Đang chờ đối thủ...');
        }
      } else if (currentItem?.type === 'group') {
        const group = currentItem.group;
        if (groupQuestionIndex < group.questions.length - 1) {
          setGroupQuestionIndex(idx => idx + 1);
          setTimeLeft(60);
          startTimeRef.current = Date.now();
        } else {
          if (currentItemIndex < items.length - 1) {
            setCurrentItemIndex(prev => prev + 1);
            setTimeLeft(60);
            startTimeRef.current = Date.now();
          } else {
            completeBattle();
            setUserCompleted(true);
            messageService.success('Bạn đã hoàn thành! Đang chờ đối thủ...');
          }
        }
      }
    }, 1500);
  };

  // Check if all participants completed -> redirect to results
  useEffect(() => {
    if (userCompleted && battleState?.participants) {
      const allCompleted = battleState.participants.every(p => p.isCompleted);
      if (allCompleted) {
        messageService.success('Tất cả người chơi đã hoàn thành!');
        router.push(`/battle/${battleId}/results`);
      }
    }
  }, [userCompleted, battleState, battleId, router]);

  const currentUserScore = leaderboard.find(p => p.userId === user?.id);
  const displayedScore = (currentUserScore?.score || 0) + localScoreDelta;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <Text className="block mt-4">Đang tải câu hỏi...</Text>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <Text>Không tìm thấy câu hỏi</Text>
        </Card>
      </div>
    );
  }

  // Show waiting UI if user completed
  if (userCompleted) {
    const allCompleted = battleState?.participants?.every(p => p.isCompleted) || false;
    const completedCount = battleState?.participants?.filter(p => p.isCompleted).length || 0;
    const totalCount = battleState?.participants?.length || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-2xl mx-auto px-6">
          <Card className="shadow-lg rounded-2xl border-0 text-center p-8">
            <ClockCircleOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={2} className="!mb-4">Đang chờ đối thủ...</Title>
            <Text className="text-lg block mb-6">
              Bạn đã hoàn thành bài thi! Vui lòng chờ các thí sinh khác.
            </Text>
            <Progress
              percent={Math.round((completedCount / totalCount) * 100)}
              strokeColor={{ from: '#0ea5e9', to: '#3b82f6' }}
              className="mb-4"
            />
            <Text type="secondary">
              {completedCount}/{totalCount} người chơi đã hoàn thành
            </Text>

            {/* Show leaderboard while waiting */}
            <div className="mt-8">
              <Title level={4} className="!mb-4">Bảng xếp hạng tạm thời</Title>
              <div className="space-y-3">
                {leaderboard.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      participant.userId === user?.id
                        ? 'bg-sky-50 border-2 border-sky-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-500 w-6">
                      #{index + 1}
                    </div>
                    <Avatar src={participant.avatarUrl || undefined} icon={<UserOutlined />} />
                    <div className="flex-1 text-left">
                      <Text strong className="text-sm">{participant.userName || `User #${participant.userId}`}</Text>
                      {participant.userId === user?.id && (
                        <Tag color="blue" className="ml-2 text-xs">Bạn</Tag>
                      )}
                      {participant.isCompleted && (
                        <Tag color="green" className="ml-2 text-xs">Hoàn thành</Tag>
                      )}
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg text-sky-600">{participant.score}</Text>
                      <Text type="secondary" className="block text-xs">điểm</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-6 select-none">
      {/* Anti-cheat warning banner */}
      {tabSwitchCount > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-40">
          <WarningOutlined className="mr-2" />
          Cảnh báo: Đã phát hiện {tabSwitchCount} hành vi đáng ngờ. Vui lòng tập trung làm bài!
        </div>
      )}
      
      <div className={`max-w-7xl mx-auto px-6 ${tabSwitchCount > 0 ? 'pt-10' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl border-0 mb-4">
              {/* Timer & Progress */}
              <div className="flex items-center justify-between mb-4">
                <Tag color={timeLeft <= 10 ? 'red' : 'blue'} className="text-lg px-4 py-1">
                  {timeLeft}s
                </Tag>
                <Text type="secondary">
                  Mục {currentItemIndex + 1}/{items.length}
                </Text>
              </div>
              <Progress
                percent={(currentItemIndex / items.length) * 100}
                strokeColor={{ from: '#0ea5e9', to: '#3b82f6' }}
                showInfo={false}
              />
            </Card>

            {/* Question / Group Card */}
            {currentItem.type === 'single' && (
              <Card className="shadow-lg rounded-2xl border-0">
                <div dangerouslySetInnerHTML={{ __html: currentItem.question.contentHtml }} className="mb-6" />
                <Radio.Group
                  value={selectedAnswers[currentItem.question.id] ?? null}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const opt = currentItem.question.options.find((o: any) => o.id === val);
                    handleSelectOption(currentItem.question, val, !!opt?.isCorrect);
                  }}
                  className="w-full"
                >
                  <div className="space-y-3">
                    {currentItem.question.options.map((option: any) => {
                      const qId = currentItem.question.id;
                      const isAnswered = answeredResults[qId] !== undefined;
                      const isCorrect = answeredResults[qId] === true;
                      const isSelected = selectedAnswers[qId] === option.id;
                      return (
                        <Radio.Button
                          key={option.id}
                          value={option.id}
                          className={`w-full h-auto py-4 px-6 text-left rounded-xl shadow-sm transition ${isAnswered ? (option.isCorrect ? 'bg-green-50 border border-green-300' : (isSelected ? 'bg-red-50 border border-red-300' : 'opacity-60')) : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div dangerouslySetInnerHTML={{ __html: option.contentHtml }} />
                            <div>
                              {isAnswered && option.isCorrect && (
                                <CheckCircleOutlined className="text-green-500 text-xl" />
                              )}
                              {isAnswered && !option.isCorrect && isSelected && (
                                <CloseCircleOutlined className="text-red-500 text-xl" />
                              )}
                            </div>
                          </div>
                        </Radio.Button>
                      );
                    })}
                  </div>
                </Radio.Group>
              </Card>
            )}

            {currentItem.type === 'group' && (
              <Card className="shadow-lg rounded-2xl border-0">
                {currentItem.group.contentHtml && (
                  <div className="mb-6" dangerouslySetInnerHTML={{ __html: currentItem.group.contentHtml }} />
                )}

                <div>
                  {/* Render only the current question in the group as a single large card */}
                  {(() => {
                    const q = currentItem.group.questions[groupQuestionIndex];
                    if (!q) return null;
                    return (
                      <Card className="p-6">
                        <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} className="mb-6 text-lg" />

                        <Radio.Group
                          value={selectedAnswers[q.id] ?? null}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const opt = q.options.find((o: any) => o.id === val);
                            handleSelectOption(q, val, !!opt?.isCorrect);
                          }}
                          className="w-full"
                        >
                          <div className="grid grid-cols-1 gap-3">
                            {q.options.map((opt: any, idx: number) => {
                              const isAnswered = answeredResults[q.id] !== undefined;
                              const isCorrect = answeredResults[q.id] === true;
                              const isSelected = selectedAnswers[q.id] === opt.id;
                              return (
                                <Radio.Button
                                  key={opt.id}
                                  value={opt.id}
                                  className={`w-full py-6 px-6 text-left rounded-xl shadow-sm transition ${isAnswered ? (opt.isCorrect ? 'bg-green-50 border border-green-300' : (isSelected ? 'bg-red-50 border border-red-300' : 'opacity-60')) : 'bg-white'}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="text-base" dangerouslySetInnerHTML={{ __html: opt.contentHtml }} />
                                    <div>
                                      {isAnswered && opt.isCorrect && (
                                        <CheckCircleOutlined className="text-green-500 text-xl" />
                                      )}
                                      {isAnswered && !opt.isCorrect && isSelected && (
                                        <CloseCircleOutlined className="text-red-500 text-xl" />
                                      )}
                                    </div>
                                  </div>
                                </Radio.Button>
                              );
                            })}
                          </div>
                        </Radio.Group>
                      </Card>
                    );
                  })()}
                </div>
              </Card>
            )}

            
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="shadow-lg rounded-2xl border-0 sticky top-6">
              <div className="text-center mb-4">
                <TrophyOutlined className="text-3xl text-yellow-500 mb-2" />
                <Title level={4} className="!mb-0">Bảng xếp hạng</Title>
              </div>

              <div className="space-y-3">
                {leaderboard.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      participant.userId === user?.id
                        ? 'bg-sky-50 border-2 border-sky-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-500 w-6">
                      #{index + 1}
                    </div>
                    <Avatar src={participant.avatarUrl || undefined} icon={<UserOutlined />} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Text strong className="text-sm">{participant.userName || `User #${participant.userId}`}</Text>
                        {participant.userId === user?.id && (
                          <Tag color="blue" className="text-xs">Bạn</Tag>
                        )}
                      </div>
                      {participant.isSuspicious && (
                        <Tag color="red" className="text-xs mt-1">
                          <WarningOutlined /> Khả nghi
                        </Tag>
                      )}
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg text-sky-600">{participant.score}</Text>
                      <Text type="secondary" className="block text-xs">điểm</Text>
                    </div>
                  </div>
                ))}
              </div>

              {currentUserScore && (
                <div className="mt-4 p-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-white text-center">
                  <Text className="text-white text-sm block mb-1">Điểm của bạn</Text>
                  <Title level={2} className="!text-white !mb-0">{displayedScore}</Title>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Result overlay */}
      {showingResult && lastAnswerCorrect !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center animate-bounce-in">
            {lastAnswerCorrect ? (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                  <CheckCircleOutlined className="text-6xl text-white" />
                </div>
                <Title level={1} className="!text-green-400 !mb-2">Chính xác!</Title>
                <Text className="text-white/80 text-xl">+{localScoreDelta > 0 ? (items[currentItemIndex]?.question?.score || items[currentItemIndex]?.group?.questions?.[groupQuestionIndex]?.score || 1) : 0} điểm</Text>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                  <CloseCircleOutlined className="text-6xl text-white" />
                </div>
                <Title level={1} className="!text-red-400 !mb-2">Sai rồi!</Title>
                <Text className="text-white/80 text-xl">Đáp án không chính xác</Text>
              </div>
            )}
          </div>
          <style jsx global>{`
            @keyframes bounceIn {
              0% {
                transform: scale(0.3);
                opacity: 0;
              }
              50% {
                transform: scale(1.05);
              }
              70% {
                transform: scale(0.9);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-bounce-in {
              animation: bounceIn 0.5s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
