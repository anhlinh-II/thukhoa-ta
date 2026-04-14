"use client";

import React from 'react';
import { CrudListComponent } from '@/share/components/base/CrudListComponent';
import { quizFormatService } from '@/share/services/quiz_format/quiz-format.service';
import { ColumnsType } from 'antd/es/table';
import { QuizFormatResponse } from '@/share/services/quiz_format/model';

export default function QuizFormatsPage() {
  const columns: ColumnsType<any> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true },
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true, ellipsis: true },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString(), sorter: true },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quiz Formats</h2>
      <CrudListComponent
        config={{ queryKeyPrefix: 'quiz-formats', resourceName: 'Quiz Format', createTitle: 'Create Quiz Format', editTitle: 'Edit Quiz Format' }}
        service={quizFormatService}
        columns={columns}
      />
    </div>
  );
}
