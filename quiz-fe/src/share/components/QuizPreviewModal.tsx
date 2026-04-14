"use client";

import React from 'react';
import { Modal, Card } from 'antd';

interface Props {
  open: boolean;
  loading: boolean;
  data: any;
  onCancel: () => void;
}

export default function QuizPreviewModal({ open, loading, data, onCancel }: Props) {
  return (
    <Modal title="Quiz Preview" open={open} onCancel={onCancel} footer={null} width="90%" centered bodyStyle={{ maxHeight: '75vh', overflow: 'auto' }}>
      {loading ? (
        <div>Loading...</div>
      ) : data ? (
        <div>
          <Card title="Quiz Info" style={{ marginBottom: 16 }}>
            <p><strong>Name:</strong> {data.quiz?.examName}</p>
            <p><strong>Duration:</strong> {data.quiz?.durationMinutes} minutes</p>
            <p><strong>Total Questions:</strong> {data.totalQuestions}</p>
          </Card>

          {data.questionGroups?.map((group: any, gIdx: number) => (
            <Card key={gIdx} title={`Group: ${group.title}`} style={{ marginBottom: 16 }}>
              {group.contentHtml && <div dangerouslySetInnerHTML={{ __html: group.contentHtml }} />}
              {group.questions?.map((q: any, qIdx: number) => (
                <Card key={qIdx} size="small" style={{ marginBottom: 12, marginLeft: 16 }}>
                  <p><strong>Question {qIdx + 1}:</strong></p>
                  <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} />
                  <p><strong>Score:</strong> {q.score}</p>
                  {q.options?.map((opt: any, oIdx: number) => (
                    <div key={oIdx} style={{ marginLeft: 16, padding: 4, background: opt.isCorrect ? '#e6ffe6' : '#fff' }}>
                      {String.fromCharCode(65 + oIdx)}. {opt.contentHtml} {opt.isCorrect && '✓'}
                    </div>
                  ))}
                </Card>
              ))}
            </Card>
          ))}

          {data.standaloneQuestions?.length > 0 && (
            <Card title="Standalone Questions" style={{ marginBottom: 16 }}>
              {data.standaloneQuestions.map((q: any, qIdx: number) => (
                <Card key={qIdx} size="small" style={{ marginBottom: 12 }}>
                  <p><strong>Question {qIdx + 1}:</strong></p>
                  <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} />
                  <p><strong>Score:</strong> {q.score}</p>
                  {q.options?.map((opt: any, oIdx: number) => (
                    <div key={oIdx} style={{ marginLeft: 16, padding: 4, background: opt.isCorrect ? '#e6ffe6' : '#fff' }}>
                      {String.fromCharCode(65 + oIdx)}. {opt.contentHtml} {opt.isCorrect && '✓'}
                    </div>
                  ))}
                </Card>
              ))}
            </Card>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
