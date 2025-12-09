"use client";
import React, { useEffect, useState } from 'react';
import { Card, Button, Spin } from 'antd';
import Link from 'next/link';
import messageService from '@/share/services/messageService';
import { userLearningItemService } from '@/share/services/user_learning_item/user-learning-item.service';
import { questionService } from '@/share/services/question/question.service';
import { questionOptionService } from '@/share/services/question_option/question-option.service';

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<any | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [answering, setAnswering] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const due = await userLearningItemService.due('MOCKTEST');
        setItems(due || []);
        if ((due || []).length > 0) {
          await loadQuestion(due[0].questionId);
        }
      } catch (e) {
        console.error(e);
        messageService.error('Không thể tải danh sách ôn tập');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setStartTimeMs(Date.now());
  }, [index, question]);

  const loadQuestion = async (questionId: number) => {
    setQuestion(null);
    setOptions([]);
    setSelectedIndex(null);
    setAnswering(false);
    try {
      const q = await questionService.findById(questionId);
      const opts = await questionOptionService.findAll();
      const filtered = (opts || []).filter((o: any) => o.questionId === questionId);
      setQuestion(q);
      setOptions(filtered);
    } catch (e) {
      console.error('Failed to load question', e);
    }
  };

  const computeQuality = (isCorrect: boolean, elapsedMs: number) => {
    if (isCorrect) {
      if (elapsedMs < 4000) return 5;
      if (elapsedMs < 10000) return 4;
      return 3.5;
    } else {
      if (elapsedMs < 4000) return 2;
      if (elapsedMs < 10000) return 1;
      return 0;
    }
  };

  const handleChoice = async (optIndex: number) => {
    if (answering || !items[index]) return;
    setAnswering(true);
    setSelectedIndex(optIndex);

    try {
      const correctOptIndex = options.findIndex((o: any) => o.isCorrect === true);
      const isCorrect = optIndex === correctOptIndex;

      if (isCorrect) messageService.success('Đúng rồi!');
      else messageService.error('Sai rồi!');

      const elapsed = Date.now() - startTimeMs;
      const quality = computeQuality(isCorrect, elapsed);

      try {
        const resp = await userLearningItemService.review(items[index].id, quality);
        if (resp && resp.nextReviewAt) {
          try {
            const next = new Date(resp.nextReviewAt).toLocaleString();
            messageService.notifyInfo(`Lần ôn tiếp: ${next}`);
          } catch (e) {}
        }
      } catch (err) {
        console.error('Failed to send review', err);
      }
    } catch (err) {
      console.error(err);
      setSelectedIndex(null);
      setAnswering(false);
    }
  };

  const handleNext = async () => {
    const next = index + 1;
    setSelectedIndex(null);
    setAnswering(false);

    if (next >= items.length) {
      messageService.info('Hoàn thành ôn tập hôm nay!');
      const due = await userLearningItemService.due('MOCKTEST');
      setItems(due || []);
      setIndex(0);
      if ((due || []).length > 0) {
        await loadQuestion(due[0].questionId);
      } else {
        setQuestion(null);
        setOptions([]);
      }
    } else {
      setIndex(next);
      await loadQuestion(items[next].questionId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full text-center">
          <div className="text-xl font-semibold mb-2">Không có câu cần ôn tập hôm nay</div>
          <div className="text-gray-500 mb-4">Hãy làm bài để tạo câu cần ôn tập.</div>
          <Link href="/programs">
            <Button type="primary">Làm bài ngay</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const correctOptIndex = options.findIndex((o: any) => o.isCorrect === true);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <Card 
        title={`Ôn tập câu hỏi ${index + 1}/${items.length}`} 
        className="max-w-3xl w-full"
      >
        {question ? (
          <>
            <div 
              className="mb-6 prose max-w-none text-lg" 
              dangerouslySetInnerHTML={{ __html: question.contentHtml }} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt: any, idx: number) => {
                let base = 'p-4 rounded border cursor-pointer bg-white min-h-[70px] flex items-center transition-all';
                let extra = 'hover:shadow hover:border-sky-400';

                if (answering) {
                  if (idx === correctOptIndex) {
                    extra = 'border-2 border-green-500 text-green-700 bg-green-50';
                  } else if (selectedIndex === idx && selectedIndex !== correctOptIndex) {
                    extra = 'border-2 border-red-500 text-red-700 bg-red-50';
                  } else {
                    extra = 'opacity-60 cursor-default';
                  }
                }

                return (
                  <div
                    key={opt.id}
                    role="button"
                    onClick={() => !answering && handleChoice(idx)}
                    className={`${base} ${extra}`}
                  >
                    <div 
                      className={answering && idx === correctOptIndex ? 'font-semibold' : ''}
                      dangerouslySetInnerHTML={{ __html: opt.contentHtml }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              {answering && (
                <Button type="primary" size="large" onClick={handleNext}>
                  Tiếp theo
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Spin />
            <span className="ml-2">Đang tải câu hỏi...</span>
          </div>
        )}
      </Card>
    </div>
  );
}
