"use client";
import { useState } from 'react';
import { Table, Button, Card, message, Space, Tag, Spin, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  useQuizGroups, 
  useQuizGroupsPaged, 
  useQuizGroupsByProgram,
  useSlugExists,
  useDeleteQuizGroup,
  usePrefetchQuizGroup 
} from '../../../hooks/useQuizGroups';
import type { QuizGroup } from '../../../services/quizGroupApi';

export default function QuizGroupsPage() {
  const [testingApi, setTestingApi] = useState(false);
  
  // React Query hooks
  const { 
    data: quizGroups = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuizGroups();
  
  const { 
    data: pagedData, 
    isLoading: isLoadingPaged 
  } = useQuizGroupsPaged(0, 5);
  
  const { 
    data: programQuizGroups = [], 
    isLoading: isLoadingByProgram 
  } = useQuizGroupsByProgram(1);
  
  const { 
    data: slugExists, 
    isLoading: isCheckingSlug 
  } = useSlugExists('test-slug');
  
  const deleteQuizGroupMutation = useDeleteQuizGroup();
  const prefetchQuizGroup = usePrefetchQuizGroup();

  // Test different API endpoints
  const testApiEndpoints = async () => {
    setTestingApi(true);
    try {
      message.info('Testing all APIs...');
      
      // Test 1: Refetch all quiz groups
      console.log('Testing GET /api/v1/quiz-groups/all...');
      await refetch();
      message.success(`All Quiz Groups: ${quizGroups.length} items`);

      // Test 2: Check paged results
      console.log('Testing paged results...');
      if (pagedData) {
        message.success(`Paged API: ${pagedData.content?.length || 0} items`);
      }

      // Test 3: Check by program ID
      console.log('Testing by program ID...');
      message.success(`Program API: ${programQuizGroups.length} items for program 1`);

      // Test 4: Check slug exists
      console.log('Testing slug check...');
      message.success(`Slug API: 'test-slug' exists: ${slugExists}`);

    } catch (error) {
      console.error('API test failed:', error);
      message.error('Some API tests failed - check console for details');
    } finally {
      setTestingApi(false);
    }
  };

  // Handle delete with optimistic update
  const handleDelete = (id: number) => {
    deleteQuizGroupMutation.mutate(id);
  };

  // Handle row hover - prefetch data
  const handleRowHover = (record: QuizGroup) => {
    prefetchQuizGroup(record.id);
  };

  const columns: ColumnsType<QuizGroup> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ellipsis: true,
      render: (slug: string) => <code className="text-xs bg-gray-100 px-1 rounded">{slug || 'N/A'}</code>,
    },
    {
      title: 'Type',
      dataIndex: 'groupType',
      key: 'groupType',
      filters: [
        { text: 'Topic', value: 'TOPIC' },
        { text: 'Format', value: 'FORMAT' },
        { text: 'Mock Test', value: 'MOCK_TEST' },
      ],
      onFilter: (value, record) => record.groupType === value,
      render: (type: string) => (
        <Tag color={
          type === 'TOPIC' ? 'blue' : 
          type === 'FORMAT' ? 'orange' : 
          type === 'MOCK_TEST' ? 'green' : 'default'
        }>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Program ID',
      dataIndex: 'programId',
      key: 'programId',
      width: 100,
      sorter: (a, b) => a.programId - b.programId,
    },
    {
      title: 'Order',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      sorter: (a, b) => a.displayOrder - b.displayOrder,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => message.info(`View quiz group ${record.id}: ${record.name}`)}
            onMouseEnter={() => handleRowHover(record)}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => message.info(`Edit quiz group ${record.id}`)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            loading={deleteQuizGroupMutation.isPending}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Groups Management</h1>
        <p className="text-gray-600">Manage quiz groups and test API connectivity</p>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">API Connection Status:</h3>
            <Tag color={
              !isLoading && !isError ? 'success' : 
              isError ? 'error' : 'processing'
            }>
              {!isLoading && !isError ? '✅ Connected' : 
               isError ? '❌ Connection Error' : '🔄 Loading...'}
            </Tag>
            {isError && <span className="text-red-500 text-sm">{error?.message}</span>}
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh Data
            </Button>
            <Button 
              type="default"
              onClick={testApiEndpoints}
              loading={testingApi}
            >
              Test All APIs
            </Button>
          </Space>
        </div>
      </Card>

      {/* Actions */}
      <Card className="mb-6">
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Quiz Group
          </Button>
          <Button type="default" onClick={() => refetch()}>
            Reload Table
          </Button>
        </Space>
      </Card>

      {/* Data Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={quizGroups}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: quizGroups.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
}
