"use client";
import React from 'react';
import { Modal, Table } from 'antd';

interface IUsersWithRoleModalProps {
  open: boolean;
  onCancel: () => void;
  users: any[];
  loading?: boolean;
  title?: string;
  width?: number;
}

export default function UsersWithRoleModal({ open, onCancel, users, loading = false, title = 'Users', width = 700 }: IUsersWithRoleModalProps) {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên người dùng', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
  ];

  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={null} width={width}>
      <Table
        rowKey="id"
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
        columns={columns}
      />
    </Modal>
  );
}
