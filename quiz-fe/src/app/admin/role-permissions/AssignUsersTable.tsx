"use client";

import React from 'react';
import { Table, Input } from 'antd';

type UserItem = { id: number; username?: string; email?: string; fullName?: string };

type Props = {
  users: UserItem[];
  loading?: boolean;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onSearch: (q: string) => void;
};

export default function AssignUsersTable({ users, loading, selectedIds, onSelectionChange, onSearch }: Props) {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Full name', dataIndex: 'fullName', key: 'fullName' },
  ];

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (keys: React.Key[]) => onSelectionChange((keys as number[]) || []),
  };

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input.Search
          placeholder="Search by username or email"
          enterButton="Search"
          onSearch={(val) => onSearch(val)}
          allowClear
          style={{ width: 420 }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={users}
        columns={columns}
        loading={loading}
        rowSelection={rowSelection}
        pagination={false}
      />
    </div>
  );
}
