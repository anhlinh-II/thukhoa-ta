"use client";

import React from 'react';
import { CrudListComponent } from '@/share/components/base/CrudListComponent';
import { quizTopicService } from '@/share/services/quiz_topic/quiz-topic.service';
import { ColumnsType } from 'antd/es/table';

export default function QuizTopicsPage() {
  const columns: ColumnsType<any> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true, ellipsis: true },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString(), sorter: true },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz Topics</h2>
      <CrudListComponent
        config={{ queryKeyPrefix: 'quiz-topics', resourceName: 'Quiz Topic', createTitle: 'Create Quiz Topic', editTitle: 'Edit Quiz Topic' }}
        service={quizTopicService}
        columns={columns}
      />
    </div>
  );
}
