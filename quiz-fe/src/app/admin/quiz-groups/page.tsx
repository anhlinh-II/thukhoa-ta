"use client";
import React, { useState, useRef } from 'react';
import { Form, Input, Switch, Splitter } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CrudListComponent } from '../../../components/CrudListComponent';
import TreeView from '../../../components/TreeView';
import { programService } from '../../../services/programService';
import { quizGroupService } from '../../../services/quiz_group/quiz-group.service';
import { FilterItemDto } from '@/types';
import { QuizGroupRequest, QuizGroupResponse } from '@/services/quiz_group/models';

export default function QuizGroup() {
  const [selectedProgramIds, setSelectedProgramIds] = useState<Array<string | number> | null>(null);
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
  ];

  // merge program filter when a program (or program + descendants) is selected
  const mergedFilters = React.useMemo(() => {
    const base = [...fixedFilters];
    if (selectedProgramIds && selectedProgramIds.length > 0) {
      if (selectedProgramIds.length === 1) {
        base.push({ field: 'program_id', operator: '=', value: Number(selectedProgramIds[0]) });
      } else {
        base.push({ field: 'program_id', operator: 'IN', value: selectedProgramIds.map((v) => Number(v)) });
      }
    }
    return base;
  }, [selectedProgramIds]);

  return (
    <div style={{ height: 'calc(100vh - 64px)', background: 'transparent' }}>
      <Splitter layout="horizontal" style={{ height: '100%' }}> 
        <Splitter.Panel defaultSize={320} min={200} max={640}>
          <div className='p-1 mt-1 h-full'>
            <div className='h-full'>
              <TreeView
                getChildren={true}
                title="Chương trình ôn luyện"
                service={programService}
                titleField="name"
                idField="id"
                onSelect={(id, node, idList) => {
                  if (idList && idList.length > 0) setSelectedProgramIds(idList);
                  else if (id !== null && id !== undefined) setSelectedProgramIds([id]);
                  else setSelectedProgramIds(null);
                }}
              />
            </div>
          </div>
        </Splitter.Panel>

        <Splitter.Panel>
          <div className='p-1 mt-1'>
            <CrudListComponent
              config={{
                queryKeyPrefix: 'quiz-groups-base',
                resourceName: 'Quiz Group',
                createTitle: 'Create New Quiz Group',
                editTitle: 'Edit Quiz Group',
                pageSize: 100,
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
                style: { tableLayout: 'auto' },
                showSorterTooltip: { target: 'sorter-icon' },
                expandable: {
                  expandedRowRender: (record: QuizGroupResponse) => (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Created:</strong> {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ''}
                        </div>
                        <div>
                          <strong>Updated:</strong> {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : ''}
                        </div>
                        <div className="col-span-2">
                          <strong>Full Description:</strong> {record.description}
                        </div>
                      </div>
                    </div>
                  ),
                  rowExpandable: (record: QuizGroupResponse) => !!record.description,
                },
              }}
              filterParams={mergedFilters}
              searchFields={['name', 'description', 'slug', 'programName']}
              searchPlaceholder="Search quiz groups..."
            />
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}
