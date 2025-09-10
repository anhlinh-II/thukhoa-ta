"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to quiz-groups page by default
    router.replace('/admin/quiz-groups');
  }, [router]);

  return null; // or a loading spinner
}
