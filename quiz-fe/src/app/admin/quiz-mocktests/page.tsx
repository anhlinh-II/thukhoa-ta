"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CrudListComponent } from "@/components/CrudListComponent";
import { QuizMockTestRequest, QuizMockTestResponse, quizMockTestService } from "@/services/quizMockTestService";
import { FilterItemDto } from "@/types";
import { Form, Input, Switch, InputNumber, Select, Button, Modal, Card, Tabs, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import { quizGroupService } from '@/services/quiz_group/quiz-group.service';
import { EyeOutlined } from '@ant-design/icons';
import QuizMockTestFormComponent from './QuizMockTestFormComponent';
import { ENV } from '@/config/env';

// A small client-side selector that searches quiz groups (take 10) via backend and lets user pick one.
function QuizGroupSelector({ form, initialValue }: { form: any; initialValue?: number }) {
     const [options, setOptions] = useState<Array<{ label: string; value: number }>>([]);
     const [loading, setLoading] = useState(false);
     const [selected, setSelected] = useState<any | null>(null);
     const timerRef = useRef<number | null>(null);

     useEffect(() => {
          // load initial selected group if editing
          if (initialValue) {
               quizGroupService.findById(initialValue).then(r => {
                    setSelected(r as any);
                    form.setFieldsValue({ quizGroup: initialValue });
                    setOptions([{ label: (r as any).name || (r as any).title || (r as any).programName, value: (r as any).id }]);
               }).catch(() => {});
          }
     }, [initialValue]);

     const doSearch = (q: string) => {
          setLoading(true);
          const filters = q ? [{ field: 'name', operator: 'CONTAINS', value: q }] : [];
          const req = {
               skip: 0,
               take: 10,
               filter: filters.length ? JSON.stringify(filters) : '',
          } as any;
          quizGroupService.getViewsPagedWithFilter(req)
               .then((resp: any) => {
                    const list = resp?.data || [];
                    setOptions(list.map((g: any) => ({ label: g.name || g.title || g.programName, value: g.id })));
               })
               .catch((e) => {
                    console.error('Group search failed', e);
                    setOptions([]);
               })
               .finally(() => setLoading(false));
     };

     useEffect(() => {
          return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
     }, []);

     const pick = (value: number, option: any) => {
          const item = { id: value, name: option?.label };
          setSelected(item as any);
          form.setFieldsValue({ quizGroup: value });
     };

     return (
          <Form.Item label="Quiz Group" name="quizGroup" rules={[{ required: true, message: 'Please select group ID' }]}>
               <Select
                    showSearch
                    allowClear
                    placeholder="Search quiz groups"
                    notFoundContent={loading ? 'Loading...' : null}
                    filterOption={false}
                    onSearch={(v) => {
                         if (timerRef.current) window.clearTimeout(timerRef.current);
                         timerRef.current = window.setTimeout(() => doSearch(v), 250);
                    }}
                    onChange={pick}
                    options={options}
                    loading={loading}
               />
          </Form.Item>
     );
}

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
               title: 'Name',
               dataIndex: 'examName',
               key: 'name',
               ellipsis: true,
               sorter: true,
               width: 300,
          },
          {
               title: 'Description',
               dataIndex: 'description',
               key: 'description',
               ellipsis: true,
               width: 300,
               render: (text: string) => text || 'No description',
          },
          {
               title: 'Slug',
               dataIndex: 'slug',
               key: 'slug',
               width: 300,
               ellipsis: true,
               render: (text: string) => text || 'No slug',
          },
          {
               title: 'Group Name',
               dataIndex: 'groupName',
               width: 300,
               key: 'groupName',
               ellipsis: true,
               render: (text: string) => text || 'No group name',
          },
          {
               title: 'Status',
               dataIndex: 'isDeleted',
               key: 'isDeleted',
               width: 100,
               render: (isDeleted: boolean) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${!isDeleted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                         }`}>
                         {!isDeleted ? 'Active' : 'Deleted'}
                    </span>
               ),
          },
          {
               title: 'Created',
               dataIndex: 'createdAt',
               key: 'createdAt',
               width: 120,
               render: (date: string) => new Date(date).toLocaleDateString(),
               sorter: true,
          },
          {
               title: 'Updated',
               dataIndex: 'updatedAt',
               key: 'updatedAt',
               width: 120,
               render: (date: string) => new Date(date).toLocaleDateString(),
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
                         resourceName: 'Quiz Mock Test',
                         createTitle: 'Create Quiz Mock Test',
                         editTitle: 'Edit Quiz Mock Test',
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
                              title="Preview Quiz"
                         />
                    )}
                    onCreateSuccess={(data: QuizMockTestResponse) => {
                         console.log('Quiz mock test created:', data);
                    }}
                    onUpdateSuccess={(data: QuizMockTestResponse) => {
                         console.log('Quiz mock test updated:', data);
                    }}
                    onDeleteSuccess={() => {
                         console.log('Quiz mock test deleted');
                    }}
                    tableProps={{
                         bordered: true,
                         style: { tableLayout: 'auto' },
                    }}
                    filterParams={fixedFilters}
                    searchFields={['title', 'slug', 'examName']}
                    searchPlaceholder="Search quiz mock tests..."
               />

               <Modal
                    title="Quiz Preview"
                    open={previewVisible}
                    onCancel={() => setPreviewVisible(false)}
                    footer={null}
                    width="90%"
                    centered
                    bodyStyle={{ maxHeight: '75vh', overflow: 'auto' }}
               >
                    {previewLoading ? (
                         <div>Loading...</div>
                    ) : previewData ? (
                         <div>
                              <Card title="Quiz Info" style={{ marginBottom: 16 }}>
                                   <p><strong>Name:</strong> {previewData.quiz?.examName}</p>
                                   <p><strong>Duration:</strong> {previewData.quiz?.durationMinutes} minutes</p>
                                   <p><strong>Total Questions:</strong> {previewData.totalQuestions}</p>
                              </Card>

                              {previewData.questionGroups?.map((group: any, gIdx: number) => (
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

                              {previewData.standaloneQuestions?.length > 0 && (
                                   <Card title="Standalone Questions" style={{ marginBottom: 16 }}>
                                        {previewData.standaloneQuestions.map((q: any, qIdx: number) => (
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
          </>
     )
}