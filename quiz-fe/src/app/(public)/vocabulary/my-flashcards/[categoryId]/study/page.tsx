"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, Button, Spin, message, Progress } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useIsAuthenticated } from "@/share/hooks/useAuth";
import {
  flashcardCategoryService,
  flashcardItemService,
} from "@/share/services/my_flashcard/my-flashcard.service";
import {
  FlashcardCategoryResponse,
  FlashcardItemResponse,
} from "@/share/services/my_flashcard/models";
import styles from "../../../flashcards/flashcard.module.css";

export default function StudyPage() {
  const { isAuthenticated } = useIsAuthenticated();
  const params = useParams();
  const categoryId = Number(params.categoryId);

  const [category, setCategory] = useState<FlashcardCategoryResponse | null>(null);
  const [queue, setQueue] = useState<FlashcardItemResponse[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, notRemembered: 0 });
  const [completed, setCompleted] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const failedCardsRef = useRef<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catData, itemsData] = await Promise.all([
        flashcardCategoryService.findById(categoryId),
        flashcardItemService.getItemsByCategory(categoryId),
      ]);
      setCategory(catData);
      const shuffled = (itemsData || []).sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setTotalCards(shuffled.length);
      failedCardsRef.current = new Set();
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isAuthenticated && categoryId) {
      fetchData();
    }
  }, [isAuthenticated, categoryId, fetchData]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRemembered = async () => {
    if (isAnimating) return;
    const currentItem = queue[0];
    if (!currentItem) return;

    setIsAnimating(true);
    setSwipeDirection('right');

    try {
      await flashcardItemService.reviewItem(currentItem.id, true);
    } catch (e) {
      console.error("Failed to save review", e);
    }

    if (!failedCardsRef.current.has(currentItem.id)) {
      setStats((prev) => ({
        ...prev,
        remembered: prev.remembered + 1,
      }));
    }

    setTimeout(() => {
      const newQueue = queue.slice(1);
      if (newQueue.length === 0) {
        setCompleted(true);
      } else {
        setQueue(newQueue);
        setIsFlipped(false);
      }
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleNotRemembered = async () => {
    if (isAnimating) return;
    const currentItem = queue[0];
    if (!currentItem) return;

    setIsAnimating(true);
    setSwipeDirection('left');

    try {
      await flashcardItemService.reviewItem(currentItem.id, false);
    } catch (e) {
      console.error("Failed to save review", e);
    }

    if (!failedCardsRef.current.has(currentItem.id)) {
      failedCardsRef.current.add(currentItem.id);
      setStats((prev) => ({
        ...prev,
        notRemembered: prev.notRemembered + 1,
      }));
    }

    setTimeout(() => {
      const newQueue = [...queue.slice(1), currentItem];
      setQueue(newQueue);
      setIsFlipped(false);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleRestart = () => {
    failedCardsRef.current = new Set();
    setStats({ remembered: 0, notRemembered: 0 });
    setCompleted(false);
    setIsFlipped(false);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Học Flashcard</h2>
          <p className="mb-4">Bạn cần đăng nhập để sử dụng tính năng này.</p>
          <Link href="/auth/login">
            <Button type="primary">Đăng nhập</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (totalCards === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-4">Không có thẻ để học</h2>
          <p className="mb-4">Hãy thêm một số thẻ vào danh mục này trước.</p>
          <Link href={`/vocabulary/my-flashcards/${categoryId}`}>
            <Button type="primary">Quay lại danh mục</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (completed) {
    const percent = totalCards > 0 ? Math.round((stats.remembered / totalCards) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Card className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">🎉 Hoàn thành!</h2>
            <p className="text-lg mb-6">
              Bạn đã học xong {totalCards} thẻ trong danh mục{" "}
              <strong style={{ color: category?.color }}>{category?.name}</strong>
            </p>

            <div className="mb-6">
              <Progress
                type="circle"
                percent={percent}
                format={() => `${percent}%`}
                strokeColor={percent >= 70 ? "#52c41a" : percent >= 40 ? "#faad14" : "#f5222d"}
              />
            </div>

            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {stats.remembered}
                </div>
                <div className="text-sm text-gray-500">Nhớ ngay</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">
                  {stats.notRemembered}
                </div>
                <div className="text-sm text-gray-500">Cần ôn lại</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRestart}
              >
                Học lại
              </Button>
              <Link href={`/vocabulary/my-flashcards/${categoryId}`}>
                <Button>Quay lại danh mục</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentItem = queue[0];
  const cardsRemaining = queue.length;
  const progress = totalCards > 0 ? Math.round(((totalCards - cardsRemaining) / totalCards) * 100) : 0;

  if (!currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/vocabulary/my-flashcards/${categoryId}`}>
            <Button type="default" icon={<ArrowLeftOutlined />}>
              Quay lại
            </Button>
          </Link>
          <h2
            className="text-xl font-bold"
            style={{ color: category?.color || "#3b82f6" }}
          >
            {category?.name}
          </h2>
          <div style={{ width: 96 }} />
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>
              Còn {cardsRemaining} thẻ / {totalCards} thẻ
            </span>
            <span>
              <span className="text-green-500">{stats.remembered} nhớ</span> /{" "}
              <span className="text-orange-500">{stats.notRemembered} chưa nhớ</span>
            </span>
          </div>
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={category?.color || "#3b82f6"}
          />
        </div>

        <div className={styles.perspectiveContainer} style={{ minHeight: 300 }}>
          <div
            className={`${styles.card} ${isFlipped ? styles.flipped : ""} ${swipeDirection === 'left' ? styles.swipeLeft : ""} ${swipeDirection === 'right' ? styles.swipeRight : ""}`}
            onClick={handleFlip}
          >
            <div
              className={styles.cardFace}
              style={{
                backgroundColor: "#19ada5",
                color: "white",
              }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold">{currentItem.frontContent}</h3>
              </div>
            </div>
            <div 
              className={`${styles.cardFace} ${styles.cardBack}`}
               style={{
                 backgroundColor: "#9ee5e1",
                 color: "#19ada5"
               }}
            >
              <div className="text-center">
                <h3 className="text-xl font-medium">
                  {currentItem.backContent}
                </h3>
                {currentItem.example && (
                  <p className="mt-4 text-sm italic">
                    Ví dụ: {currentItem.example}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="large"
              danger
              icon={<CloseOutlined style={{ fontWeight: '600' }} />}
              onClick={handleNotRemembered}
              style={{fontWeight: '600'}}
            >
              Chưa nhớ
            </Button>
            <Button
              size="large"
              icon={<CheckOutlined style={{ color: "#059669", fontWeight: '600' }} />}
              onClick={handleRemembered}
              style={{ backgroundColor: "#9ee5e1", borderColor: "#9ee5e1", color: "#059669", fontWeight: '600' }}
            >
              Đã nhớ
            </Button>
          </div>
        )}

        {!isFlipped && (
          <div className="text-center mt-6 text-gray-500">
            Nhấn vào thẻ để xem nghĩa
          </div>
        )}
      </div>
    </div>
  );
}
