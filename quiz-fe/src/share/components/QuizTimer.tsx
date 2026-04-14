"use client";

import React, { useState, useEffect, MutableRefObject } from 'react';
import { Card, Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface QuizTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  onSubmit: () => void;
  answeredCount: number;
  totalQuestions: number;
  highlightMode: boolean;
  onClearHighlights: () => void;
  timeLeftRef: MutableRefObject<number>;
}

export default function QuizTimer({
  initialSeconds,
  onTimeUp,
  onSubmit,
  answeredCount,
  totalQuestions,
  highlightMode,
  onClearHighlights,
  timeLeftRef,
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = prev - 1;
        timeLeftRef.current = newValue;
        if (newValue <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, timeLeftRef]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-6 text-center" bordered={false}>
      <Text type="secondary" className="block mb-2">Thời gian còn lại</Text>
      <div className={`text-4xl font-bold mb-4 ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
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
        onClick={onSubmit}
        disabled={answeredCount === 0}
      >
        NỘP BÀI
      </Button>

      {highlightMode && (
        <Button
          type="text"
          size="small"
          block
          className="mt-2"
          onClick={onClearHighlights}
        >
          Xóa tất cả highlights
        </Button>
      )}
    </Card>
  );
}
