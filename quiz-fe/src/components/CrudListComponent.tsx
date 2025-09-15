"use client";
import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Card, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { BaseHooks, BaseHooksConfig } from '../hooks/BaseHooks';
import { BaseService, BaseEntity, BaseRequest, BaseResponse, BaseView, PagingRequest } from '../services/BaseService';

export interface BaseComponentConfig extends BaseHooksConfig {
  title: string;
  createTitle?: string;
  editTitle?: string;
  showViewColumn?: boolean;
  pageSize?: number;
}

export interface BaseComponentProps<
  Entity extends BaseEntity = BaseEntity,
  Request extends BaseRequest = BaseRequest,
  Response extends BaseResponse = BaseResponse,
  View extends BaseView = BaseView
> {
  config: BaseComponentConfig;
  service: BaseService<Entity, Request, Response, View>;
  columns: ColumnsType<Response>;
  renderForm?: (form: any, initialValues?: Partial<Request>, isEdit?: boolean) => React.ReactNode;
  customActions?: (record: Response) => React.ReactNode;
  tableProps?: Omit<TableProps<Response>, 'dataSource' | 'columns'>;
  onCreateSuccess?: (data: Response) => void;
  onUpdateSuccess?: (data: Response) => void;
  onDeleteSuccess?: () => void;
}

export function CrudListComponent<
  Entity extends BaseEntity = BaseEntity,
  Request extends BaseRequest = BaseRequest,
  Response extends BaseResponse = BaseResponse,
  View extends BaseView = BaseView
>({
  config,
  service,
  columns,
  renderForm,
  customActions,
  tableProps,
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}: BaseComponentProps<Entity, Request, Response, View>) {
  // Initialize hooks
  const hooks = new BaseHooks(service, config);

  // State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Response | null>(null);
  const [pagination, setPagination] = useState<PagingRequest>({
    page: 0,
    size: config.pageSize || 10,
  });

  // Form
  const [form] = Form.useForm();

  // Queries
  const [pagedData, setPagedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const refetch = () => {
    setIsLoading(true);
    service.getViewsPagedWithFilter({
      skip: (pagination.page || 0) * (pagination.size || 10),
      take: pagination.size || 10,
      sort: '',
      columns: '',
      filter: '',
      emptyFilter: '',
      isGetTotal: true,
      customParam: {},
    }).then((data) => {
      console.log(data);
      setPagedData(data.data);
    }).finally(() => setIsLoading(false));
  };

  React.useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  // Mutations
  const createMutation = hooks.useCreate({
    onSuccess: (data) => {
      setIsModalVisible(false);
      form.resetFields();
      onCreateSuccess?.(data);
    },
  });

  const updateMutation = hooks.useUpdate({
    onSuccess: (data) => {
      setIsModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      onUpdateSuccess?.(data);
    },
  });

  const deleteMutation = hooks.useDelete({
    onSuccess: () => {
      onDeleteSuccess?.();
    },
  });

  // Event handlers
  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Response) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string | number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingRecord) {
        updateMutation.mutate({ id: editingRecord.id, request: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleTableChange = (tablePagination: any) => {
    setPagination({
      page: tablePagination.current - 1,
      size: tablePagination.pageSize,
    });
  };

  // Build columns with actions
  const buildColumns = (): ColumnsType<Response> => {
    const actionColumn: ColumnsType<Response>[0] = {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {customActions?.(record)}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            loading={updateMutation.isPending}
          />
          <Popconfirm
            title={`Delete ${config.resourceName}`}
            description={`Are you sure you want to delete this ${config.resourceName.toLowerCase()}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            />
          </Popconfirm>
        </Space>
      ),
    };

    return [...columns, actionColumn];
  };

  // Default form renderer
  const defaultFormRenderer = () => (
    <Form.Item
      label="Name"
      name="name"
      rules={[{ required: true, message: 'Please input name!' }]}
    >
      <Input placeholder="Enter name" />
    </Form.Item>
  );

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 m-0">{config.title}</h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              style={{ fontSize: 14 }}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              loading={createMutation.isPending}
              style={{ fontSize: 14 }}
            >
              Create {config.resourceName}
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table<Response>
          columns={buildColumns()}
          dataSource={pagedData || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: (pagination.page || 0) + 1,
            pageSize: pagination.size || 10,
            total: pagedData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
          {...tableProps}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? (config.editTitle || `Edit ${config.resourceName}`) : (config.createTitle || `Create ${config.resourceName}`)}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          {renderForm ? renderForm(form, (editingRecord as unknown as Partial<Request>) || {}, !!editingRecord) : defaultFormRenderer()}
        </Form>
      </Modal>
    </div>
  );
}
