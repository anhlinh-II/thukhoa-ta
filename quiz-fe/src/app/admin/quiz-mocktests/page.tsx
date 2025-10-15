"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CrudListComponent } from "@/components/CrudListComponent";
import { QuizMockTestRequest, QuizMockTestResponse, quizMockTestService } from "@/services/quizMockTestService";
import { FilterItemDto } from "@/types";
import { Form, Input, Switch, InputNumber, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import { quizGroupService } from '@/services/quizGroupService';

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

     const renderForm = (form: any, initialValues?: Partial<QuizMockTestRequest>, isEdit?: boolean) => (
          <>
                    <QuizGroupSelector form={form} initialValue={initialValues?.quizGroup as number | undefined} />

                    <Form.Item label="Exam Name" name="examName">
                         <Input />
                    </Form.Item>

                    <Form.Item label="Description" name="description" rules={[{ max: 2000, message: 'Description too long' }]}>
                         <Input.TextArea rows={4} showCount maxLength={2000} />
                    </Form.Item>

                    <Form.Item label="Duration (minutes)" name="durationMinutes">
                         <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item label="Active" name="isActive" valuePropName="checked">
                         <Switch />
                    </Form.Item>
          </>
     );

     const fixedFilters: FilterItemDto[] = [
          { field: 'is_deleted', operator: "=", value: false },
          { field: 'is_active', operator: "=", value: true },
     ];

     return (
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
                    showSorterTooltip: { target: 'sorter-icon' },
               }}
                    filterParams={fixedFilters}
                    searchFields={['title', 'slug', 'examName']}
                    searchPlaceholder="Search quiz mock tests..."
          />
     )
}