"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import ReviewQuestion from '@/share/components/ReviewQuestion';
import { useIsAuthenticated } from '@/share/hooks/useAuth';

export default function VocabularyReviewPage() {
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();
  const userId = (user as any)?.id as number | undefined;

  // Render a stable outer container so server and client markup match.
  // We intentionally do not display a separate loading-only view here (it caused hydration mismatches).
  return (
    <div className="w-full h-full py-2 px-4">
      {!isAuthenticated ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Ôn tập từ vựng</h2>
          <p>Bạn cần đăng nhập để bắt đầu ôn tập từ vựng.</p>
          <Link href="/auth/login">
            <Button type="primary" className="mt-4">Đăng nhập</Button>
          </Link>
        </>
      ) : !userId ? (
        <div className="text-center">Không tìm thấy thông tin người dùng.</div>
      ) : (
        <ReviewQuestion userId={userId} />
      )}
    </div>
  );
}
