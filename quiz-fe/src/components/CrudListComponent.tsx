"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Resizable } from 'react-resizable';
import { Table, Button, Space, Modal, Form, Input, Card, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { BaseHooks, BaseHooksConfig } from '../hooks/BaseHooks';
import { BaseService, BaseEntity, BaseRequest, BaseResponse, BaseView, PagingRequest, PagingViewRequest } from '../services/BaseService';
import { FilterItemDto } from '@/types';

export interface BaseComponentConfig extends BaseHooksConfig {
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
  filterParams?: FilterItemDto[];
  searchFields?: string[];
  searchPlaceholder?: string;
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
  filterParams,
  searchFields,
  searchPlaceholder,
}: BaseComponentProps<Entity, Request, Response, View>) {
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

  // table body dynamic height so pagination/footer stays visible
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [tableBodyHeight, setTableBodyHeight] = useState<number>(400);

  useEffect(() => {
    const compute = () => {
      // try to compute using the surrounding Card header height so pagination/footer stays visible
      const wrapperEl = wrapperRef.current;
      const top = wrapperEl?.getBoundingClientRect().top ?? 0;
      // find closest ant-card to measure its header height
      const cardEl = wrapperEl?.closest ? (wrapperEl.closest('.ant-card') as HTMLElement | null) : null;
      const headEl = cardEl?.querySelector('.ant-card-head') as HTMLElement | null;
      const headH = headEl?.getBoundingClientRect().height ?? 56;
      // reserve space for pagination and some padding
      const paginationReserve = 72; // pagination + margins
      const avail = Math.max(120, window.innerHeight - top - headH - paginationReserve - 16);
      setTableBodyHeight(avail);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('resize', compute);
      // cleanup search timer
      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, []);

  const [searchText, setSearchText] = useState('');
  const searchTimer = useRef<number | null>(null);
  const isSearchUpdateRef = useRef(false); // Flag to prevent double API calls during search
  const DEBOUNCE_MS = 350;

  const normalizeOperator = (op?: string | null): string | undefined => {
    if (!op && op !== '') return undefined;
    const s = String(op).trim();
    if (!s) return undefined;
    const map: Record<string, string> = {
      '=': 'EQUALS',
      '==': 'EQUALS',
      '!=': 'NOT_EQUALS',
      '<>': 'NOT_EQUALS',
      '>': 'GREATER_THAN',
      '<': 'LESS_THAN',
      '>=': 'GREATER_THAN_OR_EQUAL',
      '<=': 'LESS_THAN_OR_EQUAL',
      'CONTAINS': 'CONTAINS',
      'NCONTAINS': 'NOT_CONTAINS',
      'NOT_CONTAINS': 'NOT_CONTAINS',
      'STARTSWITH': 'STARTS_WITH',
      'ENDSWITH': 'ENDS_WITH',
      'BETWEEN': 'BETWEEN',
      'NOT BETWEEN': 'NOT_BETWEEN',
      'IN': 'IN',
      'NOT IN': 'NOT_IN',
      'EMPTY': 'EMPTY',
      'NEMPTY': 'NOT_EMPTY',
      'NOT_EMPTY': 'NOT_EMPTY',
      'IS NULL': 'IS_NULL',
      'IS NOT NULL': 'IS_NOT_NULL',
    };
    const up = s.toUpperCase();
    if (map[up]) return map[up];
    return up;
  };

  const normalizeFilterItem = (item: any): FilterItemDto => {
    const normalized: any = { ...item };
    if ('operator' in normalized) {
      normalized.operator = normalizeOperator(normalized.operator);
    }
    if (Array.isArray(normalized.ors)) {
      normalized.ors = normalized.ors.map((o: any) => normalizeFilterItem(o));
    }
    return normalized as FilterItemDto;
  };

  const refetch = (searchValue?: string) => {
    setIsLoading(true);
    const paramPagingDto: PagingViewRequest = {
      skip: (pagination.page || 0) * (pagination.size || 10),
      take: pagination.size || 10,
      sort: '',
      columns: '',
      emptyFilter: '',
      isGetTotal: true,
      customParam: {},
    };

    // build combined filters: incoming filterParams + search filter
    const combinedFilters: FilterItemDto[] = [];

    if (filterParams && filterParams.length > 0) {
      combinedFilters.push(...filterParams.map(fp => normalizeFilterItem(fp)));
    }

    // Use provided searchValue or current searchText state
    const text = (searchValue !== undefined ? searchValue : searchText || '').trim();
    if (text && (searchFields && searchFields.length > 0)) {
      const searchOrs = searchFields.map((f) => ({
        field: f,
        operator: 'CONTAINS',
        value: text,
      } as FilterItemDto));
      combinedFilters.unshift({ ors: searchOrs } as FilterItemDto);
    }

    paramPagingDto.filter = combinedFilters.length > 0 ? JSON.stringify(combinedFilters) : '';

    service.getViewsPagedWithFilter(paramPagingDto)
      .then((resp) => {
        // expect resp to be PagingViewResponse<T>
        setPagedData(resp);
      })
      .catch((err) => {
        console.error('Refetch error', err);
        message.error('Failed to load data');
      })
      .finally(() => setIsLoading(false));
  };

  React.useEffect(() => {
    // Skip refetch if this is a search-triggered pagination update
    if (isSearchUpdateRef.current) {
      isSearchUpdateRef.current = false;
      return;
    }
    refetch();
  }, [pagination, filterParams, searchFields]);

  React.useEffect(() => {
    if (isModalVisible && editingRecord) {
      // copy only plain values to avoid issues with nested objects / prototype values
      const values: Record<string, any> = {};
      Object.keys(editingRecord as any).forEach((k) => {
        values[k] = (editingRecord as any)[k];
      });
      form.setFieldsValue(values);
    } else if (!isModalVisible) {
      form.resetFields();
    }
  }, [isModalVisible, editingRecord, form]);

  // search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchText(v);

    // clear existing timer
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }

    // debounce: refetch after delay (pagination will be reset in refetch if needed)
    searchTimer.current = window.setTimeout(() => {
      // Set flag to prevent useEffect from triggering extra API call
      isSearchUpdateRef.current = true;
      // Reset to first page and refetch
      setPagination((p) => ({ ...p, page: 0 }));
      // Use setTimeout to ensure pagination state is updated before refetch
      // Pass the search value to ensure we use the latest value, not closure
      setTimeout(() => refetch(v), 0);
    }, DEBOUNCE_MS);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    
    // clear debounce timer since we want immediate search
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    
    // Set flag to prevent useEffect from triggering extra API call
    isSearchUpdateRef.current = true;
    setPagination((p) => ({ ...p, page: 0 }));
    setTimeout(() => refetch(value), 0);
  };

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
    setIsModalVisible(true);
    // form.setFieldsValue(record);
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
    <div className="p-1 h-fit">
      <div className='p-1 bg-white rounded shadow-sm'>
        <div className="flex justify-between h-full items-center mb-2">
          <div className="flex items-center gap-4">
            {/* Search input */}
            <Input.Search
              placeholder={searchPlaceholder || 'Search'}
              allowClear
              onSearch={handleSearch}
              onChange={handleSearchChange}
              style={{ width: 320 }}
              value={searchText}
            />
          </div>

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
        <div ref={wrapperRef} className="text-sm" style={{ fontSize: 13 }}>
        <Table<Response>
          className="small-table"
          columns={buildColumns()}
          dataSource={pagedData?.data || []}
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
          scroll={{ x: 1200, y: tableBodyHeight }}
          size="small"
          {...tableProps}
        />
        </div>
      </div>

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