"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Spin } from 'antd';
import messageService from '@/share/services/messageService';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { userVocabularyService } from '@/share/services/user_vocabulary/user-vocabulary.service';
import { useIsAuthenticated } from '@/share/hooks/useAuth';
import { PagingViewRequest } from '@/share/services/BaseService';

export default function SpellingPage() {
  const { isAuthenticated, user } = useIsAuthenticated();
  const userId = (user as any)?.id as number | undefined;

  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shuffled, setShuffled] = useState<{ id: string; ch: string }[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    fetchCards();
  }, [isAuthenticated, userId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const req: PagingViewRequest = { skip: 0, take: 200, sort: 'createdAt DESC', isGetTotal: true };
      const res = await userVocabularyService.getViewsPagedWithFilter(req);
      setCards(res.data || []);
      setTimeout(() => prepareCard(0, res.data || []), 10);
    } catch (e) {
      console.error(e);
      messageService.error('Không thể tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const prepareCard = (index: number, list?: any[]) => {
    const arr = list || cards;
    if (!arr || arr.length === 0) return;
    const card = arr[index];
    const word: string = (card.word || '').trim();
    // split letters (keep letters and diacritics); treat each unicode char as unit
    const letters = Array.from(word);
    const shuffledLetters = shuffleArray(letters.slice());
    // map to items with unique ids to handle duplicate letters
    const items = shuffledLetters.map((ch, idx) => ({ id: `${idx}-${ch}-${Math.random().toString(36).slice(2,6)}`, ch }));
    setShuffled(items);
    setCompleted(false);
  };

  const shuffleArray = (arr: string[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // DnD-kit handlers and setup
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = shuffled.findIndex((i) => i.id === active.id);
      const newIndex = shuffled.findIndex((i) => i.id === over.id);
      const next = arrayMove(shuffled, oldIndex, newIndex);
      setShuffled(next);
      checkCurrent(next);
    }
  };

  const checkCurrent = (items?: { id: string; ch: string }[]) => {
    const arr = items || shuffled;
    const current = cards[currentIndex];
    if (!current) return;
    const target = (current.word || '').trim();
    const assembled = arr.map((i) => i.ch).join('');
    if (assembled === target) {
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  };

  const handleNext = () => {
    const next = currentIndex + 1;
    if (next >= cards.length) return;
    setCurrentIndex(next);
    prepareCard(next);
  };

  const handlePrev = () => {
    const prev = currentIndex - 1;
    if (prev < 0) return;
    setCurrentIndex(prev);
    prepareCard(prev);
  };

  const resetShuffle = () => {
    prepareCard(currentIndex);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chính tả - Ôn từ vựng</h2>
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

  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-xl font-bold mb-4">Chưa có từ vựng để luyện chính tả</h2>
          <p className="mb-4">Hãy lưu một số từ để bắt đầu.</p>
          <Link href="/vocabulary">
            <Button type="primary">Quay lại danh sách</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  // parse first definition similar to flashcards
  let firstDef = '';
  try {
    if (typeof currentCard.definitions === 'string') {
      const defs = JSON.parse(currentCard.definitions);
      firstDef = Array.isArray(defs) && defs.length > 0 ? defs[0] : '';
    } else if (Array.isArray(currentCard.definitions)) {
      firstDef = currentCard.definitions[0] || '';
    }
  } catch (e) {
    console.error('parse def', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/vocabulary">
            <Button type="default">← Quay lại</Button>
          </Link>
          <h2 className="text-xl font-bold">Chính tả</h2>
          <div style={{ width: 96 }} />
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">Từ {currentIndex + 1} / {cards.length}</p>
          </div>

          <div className="mb-6">
            {/* show first definition as hint while user is arranging */}
            {firstDef && (
              <div className="mb-3 text-center text-sm text-gray-700">Gợi ý: {firstDef}</div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={shuffled.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {shuffled.map((item, idx) => (
                    <SortableLetter key={item.id} id={item.id} ch={item.ch} completed={completed} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button onClick={resetShuffle}>Shuffle</Button>
            <Button onClick={handlePrev} disabled={currentIndex === 0}>Trước</Button>
            <Button onClick={handleNext} disabled={currentIndex >= cards.length - 1}>Tiếp</Button>
          </div>

          {completed && (
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-center">{currentCard.word}</h3>
              {firstDef && (
                <p className="mt-2 text-center text-gray-700">{firstDef}</p>
              )}
            </div>
          )}

          {!completed && (
            <div className="text-center text-sm text-gray-500 mt-4">Kéo thả các chữ cái để tạo thành từ đúng</div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Sortable letter component using dnd-kit
function SortableLetter({ id, ch, completed }: { id: string; ch: string; completed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as any;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-4 py-2 rounded-md border bg-white shadow-sm select-none text-lg font-medium transition-all ${completed ? 'border-4 border-green-400 scale-105' : 'border'} ${isDragging ? 'opacity-80' : ''}`}
    >
      {ch}
    </div>
  );
}
