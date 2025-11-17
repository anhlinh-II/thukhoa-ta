"use client";
import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Radio, Typography, Spin, message } from 'antd';
import { SmileOutlined, FrownOutlined } from '@ant-design/icons';
import { userLearningItemService } from '@/share/services/user_learning_item/user-learning-item.service';
import { questionService } from '@/share/services/question/question.service';
import { questionOptionService } from '@/share/services/question_option/question-option.service';

const { Title, Text } = Typography;

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<any | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const due = await userLearningItemService.due('MOCKTEST');
        setItems(due || []);
        if ((due || []).length > 0) {
          await loadQuestion(due[0].questionId);
          setStartTime(Date.now());
        }
      } catch (e) {
        console.error(e);
        message.error('Không thể tải danh sách ôn tập');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadQuestion = async (questionId: number) => {
    setQuestion(null);
    setOptions([]);
    setSelected(null);
    try {
      const q = await questionService.findById(questionId);
      const opts = await questionOptionService.findAll();
      const filtered = (opts || []).filter((o:any) => o.questionId === questionId);
      setQuestion(q);
      setOptions(filtered);
      setStartTime(Date.now());
    } catch (e) {
      console.error('Failed to load question', e);
    }
  };

  const computeQuality = (isCorrect: boolean | null, elapsedSeconds: number | null) => {
    // mapping rules:
    // correct & <4s => 5
    // correct & 4-10s => 4
    // correct & >10s => 3
    // wrong & <4s => 2
    // wrong & >4s => 1
    // don't know => 0
    if (isCorrect === null) return 0;
    if (isCorrect) {
      if (elapsedSeconds == null) return 4;
      if (elapsedSeconds < 4) return 5;
      if (elapsedSeconds <= 10) return 4;
      return 3;
    } else {
      if (elapsedSeconds == null) return 1;
      if (elapsedSeconds < 4) return 2;
      return 1;
    }
  };

  const submitAnswer = async (dontKnow = false) => {
    if (!items[index]) return;
    setSubmitting(true);
    try {
      const now = Date.now();
      const elapsed = startTime ? (now - startTime) / 1000 : null;
      let isCorrect: boolean | null = null;
      if (dontKnow) {
        isCorrect = null;
      } else {
        const correctOpt = options.find((o:any) => o.isCorrect === true);
        if (correctOpt) {
          isCorrect = selected === correctOpt.id;
        } else {
          isCorrect = null;
        }
      }

      const quality = computeQuality(isCorrect, elapsed);
      await userLearningItemService.review(items[index].id, quality);
      message.success('Đã lưu phản hồi (quality=' + quality + ')');

      const next = index + 1;
      if (next < items.length) {
        setIndex(next);
        await loadQuestion(items[next].questionId);
        setSelected(null);
      } else {
        message.info('Hoàn thành ôn tập hôm nay');
        const due = await userLearningItemService.due('MOCKTEST');
        setItems(due || []);
        setIndex(0);
        if ((due || []).length > 0) {
          await loadQuestion(due[0].questionId);
        } else {
          setQuestion(null);
          setOptions([]);
        }
      }
    } catch (e) {
      console.error(e);
      message.error('Lưu đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // keep original quick-rate fallback
  const onRate = async (quality: number) => {
    if (!items[index]) return;
    setSubmitting(true);
    try {
      await userLearningItemService.review(items[index].id, quality);
      message.success('Đã lưu phản hồi');
      const next = index + 1;
      if (next < items.length) {
        setIndex(next);
        await loadQuestion(items[next].questionId);
        setSelected(null);
      } else {
        message.info('Hoàn thành ôn tập hôm nay');
        const due = await userLearningItemService.due('MOCKTEST');
        setItems(due || []);
        setIndex(0);
        if ((due || []).length > 0) {
          await loadQuestion(due[0].questionId);
        } else {
          setQuestion(null);
          setOptions([]);
        }
      }
    } catch (e) {
      console.error(e);
      message.error('Lưu đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin /></div>;

  if (!items || items.length === 0) {
    return (
      <div className="">
        <Card>
          <Title level={4}>Không có câu cần ôn tập hôm nay</Title>
          <Text>Hãy làm bài để tạo câu cần ôn tập.</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="">
      <Card>
        <div className="mb-4">
          <Text type="secondary">Ôn tập {index + 1}/{items.length}</Text>
          <Title level={4} className="!mt-2">Câu hỏi ôn tập</Title>
        </div>

        {question ? (
          <div>
            <div className="mb-4 prose" dangerouslySetInnerHTML={{ __html: question.contentHtml }} />

            <Radio.Group value={selected} onChange={(e) => setSelected(e.target.value)}>
              <Space direction="vertical">
                {options.map((opt:any) => (
                  <Radio key={opt.id} value={opt.id} className="p-3 border rounded">
                    <div dangerouslySetInnerHTML={{ __html: opt.contentHtml }} />
                  </Radio>
                ))}
              </Space>
            </Radio.Group>

            <div className="mt-6">
              <Text>Đánh giá khả năng nhớ (0 = không nhớ, 5 = nhớ hoàn toàn):</Text>
              <div className="mt-2 flex gap-2">
                {[0,1,2,3,4,5].map((q) => (
                  <Button key={q} onClick={() => onRate(q)} loading={submitting}>{q}</Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>Đang tải câu hỏi...</div>
        )}
      </Card>
    </div>
  );
}
