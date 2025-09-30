"use client";
import React from 'react';
import { Form, Input, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListComponent } from '../../../components/CrudListComponent';
import { quizGroupService, QuizGroupResponse, QuizGroupRequest } from '../../../services/quizGroupService';
import { FilterItemDto } from '@/types';

export default function TestBasePage() {
  const columns: ColumnsType<QuizGroupResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
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
      title: 'Program Name',
      dataIndex: 'programName',
      width: 300,
      key: 'programName',
      ellipsis: true,
      render: (text: string) => text || 'No program name',
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

  // Render form for create/edit
  const renderForm = (form: any, initialValues?: Partial<QuizGroupRequest>, isEdit?: boolean) => (
    <>
      <Form.Item
        label="Name"
        name="name"
        rules={[
          { required: true, message: 'Please input quiz group name!' },
          { min: 2, message: 'Name must be at least 2 characters!' },
          { max: 100, message: 'Name must not exceed 100 characters!' },
        ]}
      >
        <Input placeholder="Enter quiz group name" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          { max: 500, message: 'Description must not exceed 500 characters!' },
        ]}
      >
        <Input.TextArea
          placeholder="Enter description (optional)"
          rows={4}
          showCount
          maxLength={500}
        />
      </Form.Item>

      {isEdit && (
        <Form.Item
          label="Status"
          name="isDeleted"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Deleted"
            unCheckedChildren="Active"
          />
        </Form.Item>
      )}
    </>
  );

  const fixedFilters: FilterItemDto[] = [
    { field: 'is_deleted', operator: "=", value: false },
    { field: 'is_active', operator: "=", value: true },
    // { field: 'name', operator: "CONTAINS", value: 'and' }
  ];

  return (
    <CrudListComponent
      config={{
        queryKeyPrefix: 'quiz-groups-base',
        resourceName: 'Quiz Group',
        title: 'Quiz Groups Management',
        createTitle: 'Create New Quiz Group',
        editTitle: 'Edit Quiz Group',
        pageSize: 10,
      }}
      service={quizGroupService}
      columns={columns}
      renderForm={renderForm}
      onCreateSuccess={(data: QuizGroupResponse) => {
        console.log('Quiz group created:', data);
      }}
      onUpdateSuccess={(data: QuizGroupResponse) => {
        console.log('Quiz group updated:', data);
      }}
      onDeleteSuccess={() => {
        console.log('Quiz group deleted');
      }}
      tableProps={{
        bordered: true,
        expandable: {
          expandedRowRender: (record: QuizGroupResponse) => (
            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {record.id}
                </div>
                {/* <div>
                  <strong>Created:</strong> {new Date(record.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(record.updatedAt).toLocaleString()}
                </div> */}
                <div>
                  <strong>Status:</strong> {!record.isDeleted ? 'Active' : 'Deleted'}
                </div>
                {record.description && (
                  <div className="col-span-2">
                    <strong>Full Description:</strong> {record.description}
                  </div>
                )}
              </div>
            </div>
          ),
          rowExpandable: (record: QuizGroupResponse) => true,
        },
      }}
      filterParams={fixedFilters}
      searchFields={['name', 'description', 'slug', 'programName']}
      searchPlaceholder="Search quiz groups..."
    />
  );
}
