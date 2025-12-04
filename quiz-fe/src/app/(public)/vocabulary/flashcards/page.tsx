"use client";

import React, { useEffect, useState } from 'react';
import { Button, Card, Spin, message, Progress } from 'antd';
import { SoundOutlined, ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { userVocabularyService } from '@/share/services/user_vocabulary/user-vocabulary.service';
import { useIsAuthenticated } from '@/share/hooks/useAuth';
import Link from 'next/link';
import { PagingViewRequest } from '@/share/services/BaseService';
import styles from './flashcard.module.css';

interface VocabCard {
  id: number;
  word: string;
  phonetics?: any;
  definitions?: any;
  ease?: number;
}

export default function FlashcardsPage() {
  const { isAuthenticated, user } = useIsAuthenticated();
  const userId = (user as any)?.id as number | undefined;

  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'hardest' | 'easiest' | 'newest' | 'oldest'>('all');
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    fetchCards();
  }, [isAuthenticated, userId, filterMode, pageSize]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      let sortClause = 'createdAt DESC';
      switch (filterMode) {
        case 'hardest':
          sortClause = 'ease ASC';
          break;
        case 'easiest':
          sortClause = 'ease DESC';
          break;
        case 'newest':
          sortClause = 'createdAt DESC';
          break;
        case 'oldest':
          sortClause = 'createdAt ASC';
          break;
        default:
          sortClause = 'createdAt DESC';
      }
      const take = pageSize === 0 ? 9999 : pageSize;
      const req: PagingViewRequest = { skip: 0, take: take, sort: sortClause, isGetTotal: true };
      const res = await userVocabularyService.getViewsPagedWithFilter(req);
      setCards((res.data || []) as VocabCard[]);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
      message.error('Không thể tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Failed to play audio', err);
        message.error('Không thể phát âm thanh');
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Flashcard - Ôn từ vựng</h2>
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

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-2">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-4">Chưa có từ vựng nào</h2>
          <p className="mb-4">Hãy lưu một số từ vựng để bắt đầu ôn tập với flashcard.</p>
          <Link href="/vocabulary">
            <Button type="primary">Quay lại danh sách từ</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  // Parse phonetics (it's a JSON string)
  let phonetics: any[] = [];
  try {
    if (typeof currentCard.phonetics === 'string') {
      phonetics = JSON.parse(currentCard.phonetics);
    } else if (Array.isArray(currentCard.phonetics)) {
      phonetics = currentCard.phonetics;
    }
  } catch (e) {
    console.error('Failed to parse phonetics', e);
  }
  const firstPhonetic = phonetics[0];
  
  // Parse definitions (it's a JSON string array) - get only the first one
  let firstDefinition: string = '';
  try {
    if (typeof currentCard.definitions === 'string') {
      const defsArray = JSON.parse(currentCard.definitions);
      firstDefinition = Array.isArray(defsArray) && defsArray.length > 0 ? defsArray[0] : '';
    } else if (Array.isArray(currentCard.definitions)) {
      firstDefinition = currentCard.definitions[0] || '';
    }
  } catch (e) {
    console.error('Failed to parse definitions', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-2 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between">
            <Link href="/vocabulary">
              <Button icon={<ArrowLeftOutlined />} size="large" className="shadow-sm">
                Quay lại
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Flashcard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentIndex + 1} / {cards.length} từ
              </p>
            </div>
            <div className="w-20 md:w-28"></div>
          </div>

          {/* Filter and Page Size Controls */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              {/* Filter Options */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Lọc theo:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type={filterMode === 'all' ? 'primary' : 'default'}
                    onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
                    className={filterMode === 'all' ? 'shadow-md' : ''}
                  >
                    📚 Tất cả
                  </Button>
                  <Button
                    type={filterMode === 'hardest' ? 'primary' : 'default'}
                    onClick={() => { setFilterMode('hardest'); setCurrentIndex(0); }}
                    className={filterMode === 'hardest' ? 'shadow-md' : ''}
                  >
                    🔥 Khó nhất
                  </Button>
                  <Button
                    type={filterMode === 'easiest' ? 'primary' : 'default'}
                    onClick={() => { setFilterMode('easiest'); setCurrentIndex(0); }}
                    className={filterMode === 'easiest' ? 'shadow-md' : ''}
                  >
                    ✨ Dễ nhất
                  </Button>
                  <Button
                    type={filterMode === 'newest' ? 'primary' : 'default'}
                    onClick={() => { setFilterMode('newest'); setCurrentIndex(0); }}
                    className={filterMode === 'newest' ? 'shadow-md' : ''}
                  >
                    🆕 Mới nhất
                  </Button>
                  <Button
                    type={filterMode === 'oldest' ? 'primary' : 'default'}
                    onClick={() => { setFilterMode('oldest'); setCurrentIndex(0); }}
                    className={filterMode === 'oldest' ? 'shadow-md' : ''}
                  >
                    📅 Cũ nhất
                  </Button>
                </div>
              </div>

              {/* Page Size Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số lượng:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[10, 20, 50, 100].map(size => (
                    <Button
                      key={size}
                      type={pageSize === size ? 'primary' : 'default'}
                      onClick={() => { setPageSize(size); setCurrentIndex(0); }}
                      size="small"
                      className={pageSize === size ? 'shadow-md' : ''}
                    >
                      {size}
                    </Button>
                  ))}
                  <Button
                    key={0}
                    type={pageSize === 0 ? 'primary' : 'default'}
                    onClick={() => { setPageSize(0); setCurrentIndex(0); }}
                    size="small"
                    className={pageSize === 0 ? 'shadow-md' : ''}
                  >
                    Tất cả
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress 
          percent={Math.round(((currentIndex + 1) / cards.length) * 100)} 
          showInfo={false}
          strokeColor={{
            '0%': '#5ec5c0',
            '100%': '#3da8a3',
          }}
          className="mb-6"
          strokeWidth={8}
        />

        {/* Flashcard with floating nav buttons */}
        <div className={styles.perspectiveContainer}>
          <div
            className={`${styles.flashcardContainer} ${isFlipped ? styles.flipped : ''}`}
            onClick={handleFlip}
          >
            {/* Front Side */}
            <Card
              className={`${styles.flashcardFace} ${styles.flashcardFront} shadow-2xl`}
            >
              <div className="text-center w-full px-6">
                <h2 className="text-5xl font-bold mb-6 text-gray-800">{currentCard.word}</h2>
                {firstPhonetic && (
                  <div className="mb-4">
                    <p className="text-2xl text-gray-700 mb-2">{firstPhonetic.text}</p>
                    {firstPhonetic.audio && (
                      <Button
                        type="primary"
                        icon={<SoundOutlined />}
                        size="large"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(firstPhonetic.audio);
                        }}
                        className="!bg-teal-600 !border-teal-600 hover:!bg-teal-700"
                      >
                        Phát âm
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Back Side */}
            <Card
              className={`${styles.flashcardFace} ${styles.flashcardBack} shadow-2xl`}
            >
              <div className="text-center w-full px-6">
                <h3 className="text-3xl font-bold mb-4 text-gray-800">{currentCard.word}</h3>
                {firstDefinition && (
                  <div className="text-left bg-white/30 rounded-lg p-6 backdrop-blur-sm">
                    <p className="text-lg leading-relaxed text-gray-800">
                      {firstDefinition || 'Không có định nghĩa'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Floating nav buttons - inside perspective so they stay on screen */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous"
            className={`${styles.navButton} ${styles.navButtonLeft} ${currentIndex === 0 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            aria-label="Next"
            className={`${styles.navButton} ${styles.navButtonRight} ${currentIndex === cards.length - 1 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* small helper text below card */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 text-center">
            <p className="text-sm text-gray-600">Nhấn vào thẻ để lật</p>
          </div>
        </div>
      </div>
    </div>
  );
}
