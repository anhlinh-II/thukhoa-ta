"use client";

import React, { useEffect, useState } from 'react';
import { List, Skeleton, Divider } from 'antd';
import CommentItem from './CommentItem';
import CommentEditor from './CommentEditor';
import { quizCommentService } from '@/share/services/quiz_comment/quiz-comment.service';

export default function CommentList({ quizId }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    fetchComments();
  }, [quizId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await quizCommentService.findByQuiz(Number(quizId), 0, 20);
      const list = res?.content || res?.data?.content || res || [];
      setComments(list?.content ? list.content : (Array.isArray(list) ? list : (list?.data || [])));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(text: string) {
    setSubmitting(true);
    try {
      await quizCommentService.create({ quizId: Number(quizId), content: text });
      await fetchComments();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  }

  async function handleReply(parentId: number, text: string) {
    setSubmitting(true);
    try {
      // create with parentId
      await quizCommentService.create({ quizId: Number(quizId), parentId, content: text });
      await fetchComments();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  }

  return (
    <div className="mt-6">
      <Divider>Thảo luận</Divider>
      <div className="mb-4">
        <CommentEditor onSubmit={handleCreate} submitting={submitting} />
      </div>

      {loading ? (
        <Skeleton active />
      ) : (
        <List
          dataSource={comments}
          renderItem={(item: any) => (
            <CommentItem comment={item} onReply={handleReply} />
          )}
        />
      )}
    </div>
  );
}
