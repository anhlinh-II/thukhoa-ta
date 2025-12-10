"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FilterItemDto } from "@/share/utils/types";
import { Form, Input, Switch, InputNumber, Select, Button, Modal, Card, Tabs, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import { EyeOutlined, ImportOutlined } from '@ant-design/icons';
import Link from 'next/link';
import QuizMockTestFormComponent from './QuizMockTestFormComponent';
import { CrudListComponent } from '@/share/components/base/CrudListComponent';
import { ENV } from '@/share/utils/env';
import { quizGroupService } from '@/share/services/quiz_group/quiz-group.service';
import { QuizMockTestResponse, QuizMockTestRequest } from '@/share/services/quiz_mock_test/model';
import { quizMockTestService } from '@/share/services/quiz_mock_test/quiz-mocktest.service';
import { QuizGroupSelector } from './QuizGroupSelector';



export default function QuizMockTests() {
     const [previewVisible, setPreviewVisible] = useState(false);
     const [previewData, setPreviewData] = useState<any>(null);
     const [previewLoading, setPreviewLoading] = useState(false);

     const columns: ColumnsType<QuizMockTestResponse> = [
          {
               title: 'ID',
               dataIndex: 'id',
               key: 'id',
               width: 80,
               sorter: true,
          },
          {
               title: 'Tên bài Quiz',
               dataIndex: 'examName',
               key: 'name',
               ellipsis: true,
               sorter: true,
               width: 300,
          },
          {
               title: 'Mô tả',
               dataIndex: 'description',
               key: 'description',
               ellipsis: true,
               width: 300,
               render: (text: string) => text || 'Chưa có mô tả',
          },
          {
               title: 'Đường dẫn',
               dataIndex: 'slug',
               key: 'slug',
               width: 300,
               ellipsis: true,
               render: (text: string) => text || 'Chưa có',
          },
          {
               title: 'Nhóm Quiz',
               dataIndex: 'groupName',
               width: 300,
               key: 'groupName',
               ellipsis: true,
               render: (text: string) => text || 'Chưa phân nhóm',
          },
          {
               title: 'Trạng thái',
               dataIndex: 'isDeleted',
               key: 'isDeleted',
               width: 100,
               render: (isDeleted: boolean) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${!isDeleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                         }`}>
                         {!isDeleted ? 'Hoạt động' : 'Đã xóa'}
                    </span>
               ),
          },
          {
               title: 'Ngày tạo',
               dataIndex: 'createdAt',
               key: 'createdAt',
               width: 120,
               render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
               sorter: true,
          },
          {
               title: 'Cập nhật',
               dataIndex: 'updatedAt',
               key: 'updatedAt',
               width: 120,
               render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
               sorter: true,
          },
     ];

     const handlePreview = async (record: QuizMockTestResponse) => {
          setPreviewLoading(true);
          setPreviewVisible(true);
          try {
               const response = await fetch(`${ENV.API_URL}/quiz-mock-tests/${record.id}/preview`);
               const data = await response.json();
               setPreviewData(data);
          } catch (error) {
               console.error('Failed to load preview', error);
          } finally {
               setPreviewLoading(false);
          }
     };

     const renderForm = (form: any, initialValues?: Partial<QuizMockTestRequest>, isEdit?: boolean) => {
          return (
               <>
                    <QuizGroupSelector form={form} initialValue={initialValues?.quizGroup as number | undefined} />
                    <QuizMockTestFormComponent form={form} initialValues={initialValues} />
               </>
          );
     };

     const fixedFilters: FilterItemDto[] = [
          { field: 'is_deleted', operator: "=", value: false },
          { field: 'is_active', operator: "=", value: true },
     ];

     return (
          <>
               <CrudListComponent
                    config={{
                         queryKeyPrefix: 'quiz-mock-tests',
                         resourceName: 'Bài Quiz',
                         createTitle: 'Tạo bài Quiz mới',
                         editTitle: 'Chỉnh sửa bài Quiz',
                         pageSize: 100,
                    }}
                    service={quizMockTestService}
                    columns={columns}
                    renderForm={renderForm}
                    customActions={(record: QuizMockTestResponse) => (
                         <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() => handlePreview(record)}
                              title="Xem trước"
                         />
                    )}
                    onCreateSuccess={(data: QuizMockTestResponse) => {
                         console.log('Bài quiz đã tạo:', data);
                    }}
                    onUpdateSuccess={(data: QuizMockTestResponse) => {
                         console.log('Bài quiz đã cập nhật:', data);
                    }}
                    onDeleteSuccess={() => {
                         console.log('Bài quiz đã xóa');
                    }}
                    tableProps={{
                         bordered: true,
                         style: { tableLayout: 'auto' },
                    }}
                    filterParams={fixedFilters}
                    searchFields={['title', 'slug', 'examName']}
                    searchPlaceholder="Tìm kiếm bài quiz..."
                    extraHeaderButtons={
                         <Link href="/admin/quiz-management/quiz-mocktests/import">
                              <Button type="primary" icon={<ImportOutlined />}>
                                   Nhập từ Word
                              </Button>
                         </Link>
                    }
               />

               <Modal
                    title="Xem trước bài Quiz"
                    open={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width="90%"
                    centered
                    styles={{ body: { maxHeight: '75vh', overflow: 'auto' } }}
               >
                    {previewLoading ? (
                         <div>Đang tải...</div>
                    ) : previewData ? (
                         <div>
                              <Card title="Thông tin bài Quiz" style={{ marginBottom: 16 }}>
                                   <p><strong>Tên:</strong> {previewData.quiz?.examName}</p>
                                   <p><strong>Thời gian:</strong> {previewData.quiz?.durationMinutes} phút</p>
                                   <p><strong>Tổng số câu hỏi:</strong> {previewData.totalQuestions}</p>
                              </Card>

                              {previewData.questionGroups?.map((group: any, gIdx: number) => (
                                   <Card key={gIdx} title={`Nhóm: ${group.title}`} style={{ marginBottom: 16 }}>
                                        {group.contentHtml && <div dangerouslySetInnerHTML={{ __html: group.contentHtml }} />}
                                        {group.questions?.map((q: any, qIdx: number) => (
                                             <Card key={qIdx} size="small" style={{ marginBottom: 12, marginLeft: 16 }}>
                                                  <p><strong>Câu hỏi {qIdx + 1}:</strong></p>
                                                  <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} />
                                                  <p><strong>Điểm:</strong> {q.score}</p>
                                                  {q.options?.map((opt: any, oIdx: number) => (
                                                       <div key={oIdx} style={{ marginLeft: 16, padding: 4, background: opt.isCorrect ? '#e6ffe6' : '#fff', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                            <div style={{ minWidth: 20 }}>{String.fromCharCode(65 + oIdx)}.</div>
                                                            <div style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: opt.contentHtml }} />
                                                            {opt.isCorrect && <div style={{ marginLeft: 8 }}>✓</div>}
                                                       </div>
                                                  ))}
                                             </Card>
                                        ))}
                                   </Card>
                              ))}

                              {previewData.standaloneQuestions?.length > 0 && (
                                   <Card title="Câu hỏi đơn lẻ" style={{ marginBottom: 16 }}>
                                        {previewData.standaloneQuestions.map((q: any, qIdx: number) => (
                                             <Card key={qIdx} size="small" style={{ marginBottom: 12 }}>
                                                  <p><strong>Câu hỏi {qIdx + 1}:</strong></p>
                                                  <div dangerouslySetInnerHTML={{ __html: q.contentHtml }} />
                                                  <p><strong>Điểm:</strong> {q.score}</p>
                                                  {q.options?.map((opt: any, oIdx: number) => (
                                                       <div key={oIdx} style={{ marginLeft: 16, padding: 4, background: opt.isCorrect ? '#e6ffe6' : '#fff', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                            <div style={{ minWidth: 20 }}>{String.fromCharCode(65 + oIdx)}.</div>
                                                            <div style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: opt.contentHtml }} />
                                                            {opt.isCorrect && <div style={{ marginLeft: 8 }}>✓</div>}
                                                       </div>
                                                  ))}
                                             </Card>
                                        ))}
                                   </Card>
                              )}
                         </div>
                    ) : null}
               </Modal>
          </>
     )
}