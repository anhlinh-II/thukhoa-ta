"use client";

import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { CrudListComponent } from '@/share/components/CrudListComponent';
import { QuestionResponse, QuestionRequest } from '@/share/services/question/models';
import { questionService } from '@/share/services/question/question.service';
import { questionGroupService } from '@/share/services/question_group/question-group.service';
import { questionOptionService } from '@/share/services/question_option/question-option.service';
import QuestionFormComponent from './QuestionFormComponent';

export default function QuestionsPage() {
     const columns: ColumnsType<QuestionResponse> = [
          { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true },
          { title: 'Content', dataIndex: 'contentHtml', key: 'contentHtml', ellipsis: true, width: 360, render: (html: string) => <div dangerouslySetInnerHTML={{ __html: (html || '').substring(0, 200) + ((html || '').length > 200 ? '...' : '') }} /> },
          { title: 'Score', dataIndex: 'score', key: 'score', width: 100, render: (s: number) => <span className="px-2 py-1 rounded bg-blue-100">{s}</span> },
          { title: 'Order', dataIndex: 'orderIndex', key: 'orderIndex', width: 90 },
          { title: 'Group ID', dataIndex: 'groupId', key: 'groupId', width: 120 },
          { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 150, sorter: true, render: (d: string) => d ? new Date(d).toLocaleDateString() : '-' },
     ];

     const renderForm = (form: any, initialValues?: Partial<QuestionRequest>, isEdit?: boolean) => {
          if (isEdit && initialValues?.id) {
               (async () => {
                    try {
                         const opts = await questionOptionService.findAll();
                         const questionOptions = opts?.filter((o: any) => o.questionId === (initialValues as any).id) || [];
                         form.setFieldsValue({ ...initialValues, options: questionOptions });
                    } catch (e) {
                         console.error('Failed to load question options', e);
                    }
               })();
          }

          return <QuestionFormComponent form={form} initialValues={initialValues} />;
     };

     const handleCreate = async (values: any) => {
          // values can be either a single question payload (default), or
          // when creating a group it may contain:
          // { createGroup: true, group: { ... }, questions: [ { request fields, options: [...] }, ... ] }
          try {
               if (values?.createGroup) {
                    // create group first
                    const grpReq = values.questionGroup || { name: values.groupName || 'Group' };
                    const grp = await questionGroupService.create(grpReq);

                    const createdQuestions: any[] = [];
                    const questions = Array.isArray(values.questions) ? values.questions : [];

                    for (const q of questions) {
                         const qReq = { ...q, groupId: grp.id };
                         const createdQ = await questionService.create(qReq);
                         // create options if provided
                         if (Array.isArray(q.options)) {
                              for (const opt of q.options) {
                                   try {
                                        await questionOptionService.create({ ...opt, questionId: createdQ.id });
                                   } catch (e) {
                                        console.error('Failed to create option', e);
                                   }
                              }
                         }
                         createdQuestions.push(createdQ);
                    }

                    // return the first created question as a representative Response
                    return createdQuestions[0] || undefined;
               }

               // default: create single question and options
               const created = await questionService.create(values);
               if (Array.isArray(values.options)) {
                    for (const opt of values.options) {
                         try {
                              await questionOptionService.create({ ...opt, questionId: created.id });
                         } catch (e) {
                              console.error('Failed to create option', e);
                         }
                    }
               }
               return created;
          } catch (err) {
               console.error('Custom create handler failed', err);
               throw err;
          }
     };

     return (
          <div className="p-1">
               <CrudListComponent
                    config={{
                         queryKeyPrefix: 'questions',
                         resourceName: 'Question',
                         createTitle: 'Create Question',
                         editTitle: 'Edit Question',
                         pageSize: 20,
                    }}
                    service={questionService}
                    columns={columns}
                    renderForm={renderForm}
                    onCreate={handleCreate}
                    onCreateSuccess={(d: QuestionResponse) => { console.log('Question created', d); }}
                    onUpdateSuccess={(d: QuestionResponse) => { console.log('Question updated', d); }}
                    onDeleteSuccess={() => { console.log('Question deleted'); }}
                    tableProps={{ bordered: true, style: { tableLayout: 'auto' } }}
               />
          </div>
     );
}
