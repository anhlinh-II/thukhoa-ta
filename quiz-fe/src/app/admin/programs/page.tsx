"use client";
import { useState } from 'react';
import { Table, Button, Card, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  usePrograms, 
  useRootPrograms, 
  useDeleteProgram,
  usePrefetchProgram,
  type Program 
} from '../../../hooks/usePrograms';

export default function ProgramsPage() {
  const [testingApi, setTestingApi] = useState(false);
  
  // React Query hooks
  const { 
    data: programs = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = usePrograms();
  
  const { 
    data: rootPrograms = [], 
    isLoading: isLoadingRoots 
  } = useRootPrograms();
  
  const deleteProgram = useDeleteProgram();
  const prefetchProgram = usePrefetchProgram();

  // Handle delete
  const handleDelete = (id: number) => {
    deleteProgram.mutate(id);
  };

  // Handle row hover - prefetch data
  const handleRowHover = (record: Program) => {
    prefetchProgram(record.id);
  };

  // Test API endpoints
  const testApiEndpoints = async () => {
    setTestingApi(true);
    try {
      message.info('Testing Programs APIs...');
      await refetch();
      message.success(`Programs API: ${programs.length} total items, ${rootPrograms.length} root programs`);
    } catch (error) {
      message.error('Programs API test failed');
    } finally {
      setTestingApi(false);
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'orange';
      case 3: return 'red';
      default: return 'default';
    }
  };

  const columns: ColumnsType<Program> = [
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
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.parentId && (
            <div className="text-xs text-gray-500">
              Child of Program #{record.parentId}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ellipsis: true,
      render: (slug: string) => (
        <code className="text-xs bg-gray-100 px-1 rounded">{slug}</code>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      filters: [
        { text: 'Beginner', value: 1 },
        { text: 'Intermediate', value: 2 },
        { text: 'Advanced', value: 3 },
      ],
      onFilter: (value, record) => record.level === value,
      render: (level: number) => (
        <Tag color={getLevelColor(level)}>
          {getLevelName(level)}
        </Tag>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 100,
      render: (_, record) => (
        <Tag color={record.parentId ? 'blue' : 'purple'}>
          {record.parentId ? 'Child' : 'Root'}
        </Tag>
      ),
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
            onClick={() => message.info(`View program ${record.id}: ${record.name}`)}
            onMouseEnter={() => handleRowHover(record)}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => message.info(`Edit program ${record.id}`)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            loading={deleteProgram.isPending}
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Programs Management</h1>
        <p className="text-gray-600">Manage learning programs and curriculum structure</p>
      </div>

      {/* Program Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{programs.length}</div>
          <div className="text-gray-600">Total Programs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {programs.filter(p => !p.parentId).length}
          </div>
          <div className="text-gray-600">Root Programs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {programs.filter(p => p.parentId).length}
          </div>
          <div className="text-gray-600">Child Programs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {programs.filter(p => p.isActive).length}
          </div>
          <div className="text-gray-600">Active Programs</div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6">
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Program
          </Button>
          <Button type="default" onClick={() => refetch()} loading={isLoading}>
            Reload Programs
          </Button>
          <Button type="default" icon={<ReloadOutlined />} onClick={testApiEndpoints} loading={testingApi}>
            Test APIs
          </Button>
        </Space>
      </Card>

      {/* Data Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={programs}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: programs.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1200 }}
          size="small"
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Created:</strong> {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Updated:</strong> {new Date(record.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-2">
                    <strong>Full Description:</strong> {record.description}
                  </div>
                </div>
              </div>
            ),
            rowExpandable: (record) => !!record.description,
          }}
        />
      </Card>
    </div>
  );
}
