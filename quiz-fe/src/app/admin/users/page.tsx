"use client";

import React from 'react';
import { CrudListComponent } from '@/share/components/base/CrudListComponent';
import { userService } from '@/share/services/user_service/user.service';
import { ColumnsType } from 'antd/es/table';

export default function AdminUsersPage() {
  const columns: ColumnsType<any> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: true },
    { title: 'Username', dataIndex: 'username', key: 'username', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: true },
    { title: 'Status', dataIndex: 'isDeleted', key: 'isDeleted', render: (d: boolean) => d ? 'Deleted' : 'Active' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => d ? new Date(d).toLocaleDateString() : '' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý Users</h2>

      <CrudListComponent
        config={{ queryKeyPrefix: 'users', resourceName: 'User', createTitle: 'Create User', editTitle: 'Edit User' }}
        service={userService}
        columns={columns}
        searchFields={['username','email']}
      />
    </div>
  );
}
