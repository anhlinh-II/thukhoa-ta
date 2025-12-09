"use client";

import React, { useEffect, useState } from 'react';
import { Card, Button, Spin } from 'antd';
import { userVocabularyService } from '@/share/services/user_vocabulary/user-vocabulary.service';
import Link from 'next/link';
import messageService from '@/share/services/messageService';

type Option = {
  id: string;
  text: string;
  source: string;
};

type Question = {
  vocabId: number | null;
  word: string;
  prompt: string;
  options: Option[];
  correctIndex: number;
  ease?: number | null;
};

export default function ReviewQuestion({ userId }: { userId: number }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [noQuestion, setNoQuestion] = useState<boolean>(false);
  const [answering, setAnswering] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());

  useEffect(() => {
    loadBatch();
  }, [userId]);

  useEffect(() => {
    // reset timer whenever question changes
    setStartTimeMs(Date.now());
  }, [currentIndex, questions]);

  const loadBatch = async () => {
    setLoading(true);
    setNoQuestion(false);
    try {
      const list = await userVocabularyService.buildQuestions(userId, 4, 20);
      const arr: Question[] = list || [];
      if (!arr || arr.length === 0) {
        setNoQuestion(true);
        setQuestions([]);
      } else {
        setQuestions(arr);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
      messageService.error('Không lấy được câu hỏi ôn tập');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <Spin />
      </div>
    );
  }

  if (noQuestion) {
    return (
      <div className="min-h-[50vh] bg-white flex items-center justify-center px-4 py-12">
        <Card style={{ width: '100%', height: '100%' }}>
          <div className="text-center text-gray-600">Chưa có câu hỏi ôn tập trong ngày.</div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            <Link href="/vocabulary">
              <Button type="primary">Quay lại danh sách từ</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <Spin />
      </div>
    );
  }

  const q = questions[currentIndex];

  const handleChoice = async (optIndex: number) => {
    if (answering) return;
    setAnswering(true);
    setSelectedIndex(optIndex);

    try {
      const correct = optIndex === q.correctIndex;
      // show inline visual feedback first
      if (correct) messageService.success('Đúng'); else messageService.error('Sai');

      // compute elapsed and quality based on timing rules
      const elapsed = Date.now() - startTimeMs; // ms
      let quality = 0;
      if (correct) {
        if (elapsed < 4000) quality = 5;
        else if (elapsed < 10000) quality = 4;
        else quality = 3.5;
      } else {
        if (elapsed < 4000) quality = 2;
        else if (elapsed < 10000) quality = 1;
        else quality = 0;
      }

      try {
        const resp = await userVocabularyService.reviewVocabulary(q.vocabId as number, userId, quality, elapsed);
        if (resp && resp.nextReviewAt) {
          try {
            const next = new Date(resp.nextReviewAt).toLocaleString();
            messageService.notifyInfo(`Lần ôn tiếp: ${next}`);
            console.log('Next review at', next);
          } catch (e) {
            // ignore formatting errors
          }
          // update local ease display if returned
          if (resp.ease !== undefined && resp.ease !== null) {
            setQuestions(prev => {
              const copy = [...prev];
              if (copy[currentIndex]) copy[currentIndex] = { ...copy[currentIndex], ease: resp.ease };
              return copy;
            });
          }
        }
      } catch (err) {
        console.error('Failed to send review', err);
      }

      // keep feedback visible until user clicks Next
      // do not auto-advance
    } catch (err) {
      console.error(err);
      setSelectedIndex(null);
      setAnswering(false);
    }
  };

  const handleNext = () => {
    const next = currentIndex + 1;
    setSelectedIndex(null);
    if (next >= questions.length) {
      setQuestions([]);
      setNoQuestion(true);
    } else {
      setCurrentIndex(next);
    }
    setAnswering(false);
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <Card title={`Ôn: ${q.word}`} style={{ maxWidth: 800, width: '100%' }}>
        <div style={{ marginBottom: 12 }}>{q.prompt}</div>
        <div style={{ marginBottom: 12 }}>
          <div className="text-sm text-gray-500 mb-1">Ease (EF): {(q.ease ?? 0).toFixed(2)}</div>
          <div style={{ width: '100%' }}>
            <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
              <div style={{ height: 8, borderRadius: 4, background: '#36d399', width: `${Math.max(0, Math.min(100, ((q.ease ?? 0) / 5) * 100))}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(q.options ?? []).map((opt, idx) => {
            // determine styling based on answer state
            let base = 'p-4 rounded border cursor-pointer bg-white h-28 overflow-hidden flex items-center transition-all';
            let extra = 'hover:shadow';

            if (answering) {
              if (idx === q.correctIndex) {
                // correct option: green
                extra = 'border-2 border-green-500 text-green-700 bg-green-50';
              } else if (selectedIndex === idx && selectedIndex !== q.correctIndex) {
                // selected wrong option: red
                extra = 'border-2 border-red-500 text-red-700 bg-red-50';
              } else {
                extra = 'opacity-60';
              }
            }

            return (
              <div
                key={opt.id}
                role="button"
                onClick={() => handleChoice(idx)}
                className={`${base} ${extra}`}
              >
                <div className={`${answering && idx === q.correctIndex ? 'font-semibold' : ''}`}>{opt.text}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {answering ? (
            <Button type="primary" onClick={handleNext}>Tiếp theo</Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
