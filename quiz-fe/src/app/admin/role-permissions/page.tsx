"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Form, Input, Popconfirm, Tabs, Select, Checkbox, Modal } from 'antd';
import UsersWithRoleModal from '@/app/admin/role-permissions/UsersWithRoleModal';
import { rolePermissionService } from '@/share/services/role_permission/role-permission.service';
import { userService } from '@/share/services/user_service/user.service';
import AssignUsersTable from '@/app/admin/role-permissions/AssignUsersTable';
import { PagingViewRequest } from '@/share/services/BaseService';
import messageService from '@/share/services/messageService';

export default function RolePermissionsAdminPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [editingPerm, setEditingPerm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('roles');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [usersForRole, setUsersForRole] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedRoleForUsers, setSelectedRoleForUsers] = useState<any | null>(null);
  const [assignUsersModalOpen, setAssignUsersModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [selectedUserAssignIds, setSelectedUserAssignIds] = useState<number[]>([]);
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState<any | null>(null);

  const [form] = Form.useForm();
  const [permForm] = Form.useForm();

  useEffect(() => { fetchRoles(); fetchPerms(); }, []);

  async function fetchRoles() {
    setLoadingRoles(true);
    let data: any[] = [];
    try {
      const res = await rolePermissionService.getAllRoles();
      data = res || [];
      setRoles(data);
    } catch (e) { console.error(e); }
    finally {
      setLoadingRoles(false);
    }
    return data;
  }

  async function fetchPerms() {
    setLoadingPerms(true);
    try {
      const data = await rolePermissionService.getAllPermissions();
      setPermissions(data || []);
    } catch (e) { console.error(e); }
    setLoadingPerms(false);
  }

  function onRoleSelect(roleId: number | null) {
    setSelectedRoleId(roleId);
    const r = roles.find(x => x.id === roleId);
    if (r && Array.isArray(r.permissions)) setSelectedPermissionIds(r.permissions.map((p: any) => p.id));
    else setSelectedPermissionIds([]);
  }

  async function submitAssignment() {
    if (!selectedRoleId) { messageService.error('Vui lòng chọn vai trò'); return; }
    setAssigning(true);
    try {
      await rolePermissionService.assignPermissionsToRole(selectedRoleId, selectedPermissionIds);
      messageService.success('Đã gán quyền thành công');
      // refresh roles to get updated assigned permissions and update selected permissions
      const updatedRoles = await fetchRoles();
      const updatedRole = (updatedRoles || []).find((x: any) => x.id === selectedRoleId);
      if (updatedRole && Array.isArray(updatedRole.permissions)) {
        setSelectedPermissionIds(updatedRole.permissions.map((p: any) => p.id));
      } else {
        setSelectedPermissionIds([]);
      }
    } catch (e: any) { console.error(e); messageService.error(e?.message || 'Lỗi khi gán quyền'); }
    setAssigning(false);
  }

  function openCreateRole() { setEditingRole(null); form.resetFields(); setRoleModalOpen(true); }
  function openEditRole(r: any) { setEditingRole(r); form.setFieldsValue({ authority: r.authority, description: r.description }); setRoleModalOpen(true); }

  function openCreatePerm() { setEditingPerm(null); permForm.resetFields(); setPermModalOpen(true); }
  function openEditPerm(p: any) { setEditingPerm(p); permForm.setFieldsValue({ name: p.name, description: p.description, resource: p.resource, action: p.action }); setPermModalOpen(true); }

  async function submitRole() {
    try {
      const vals = await form.validateFields();
      if (editingRole) {
        await rolePermissionService.updateRole(editingRole.id, vals.authority, vals.description);
        messageService.success('Đã cập nhật vai trò');
      } else {
        await rolePermissionService.createRole(vals.authority, vals.description);
        messageService.success('Đã tạo vai trò');
      }
      setRoleModalOpen(false);
      fetchRoles();
    } catch (e: any) { console.error(e); messageService.error(e?.message || 'Lỗi'); }
  }

  async function submitPerm() {
    try {
      const vals = await permForm.validateFields();
      if (editingPerm) {
        await rolePermissionService.updatePermission(editingPerm.id, vals.name, vals.description, vals.resource, vals.action);
        messageService.success('Đã cập nhật quyền');
      } else {
        await rolePermissionService.createPermission(vals.name, vals.description, vals.resource, vals.action);
        messageService.success('Đã tạo quyền');
      }
      setPermModalOpen(false);
      fetchPerms();
    } catch (e: any) { console.error(e); messageService.error(e?.message || 'Lỗi'); }
  }

  async function deleteRole(id: number) {
    try { await rolePermissionService.deleteRole(id); messageService.success('Đã xóa'); fetchRoles(); } catch (e:any) { messageService.error(e?.message || 'Lỗi'); }
  }

  async function deletePerm(id: number) {
    try { await rolePermissionService.deletePermission(id); messageService.success('Đã xóa'); fetchPerms(); } catch (e:any) { messageService.error(e?.message || 'Lỗi'); }
  }

  const roleCols = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên vai trò', dataIndex: 'authority', key: 'authority' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Hành động', key: 'actions', render: (_: any, r: any) => (
      <Space>
          <Button size="small" onClick={() => openAssignUsers(r)}>Gán người dùng</Button>
        <Button size="small" onClick={() => viewUsers(r)}>Xem người dùng</Button>
        <Button size="small" onClick={() => openEditRole(r)}>Sửa</Button>
        <Popconfirm title="Xóa vai trò này?" onConfirm={() => deleteRole(r.id)}>
          <Button size="small" danger>Xóa</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  async function fetchUsersForRole(authority: string) {
    setLoadingUsers(true);
    try {
      const data = await rolePermissionService.getUsersByRole(authority);
      setUsersForRole(data || []);
      return data || [];
    } catch (e) { console.error(e); setUsersForRole([]); return []; } finally {
      setLoadingUsers(false);
    }
  }

  function viewUsers(r: any) {
    setSelectedRoleForUsers(r);
    setUserModalOpen(true);
    if (r && r.authority) fetchUsersForRole(r.authority);
    else setUsersForRole([]);
  }

  async function fetchUsers(query: string = '') {
    setLoadingAllUsers(true);
    try {
      const request: PagingViewRequest = {
        skip: 0,
        take: 50,
        columns: '',
        filter: query
          ? JSON.stringify([
              {
                field: null,
                operator: null,
                ors: [
                  { field: 'username', operator: 'CONTAINS', value: query, dataType: 'STRING' },
                  { field: 'email', operator: 'CONTAINS', value: query, dataType: 'STRING' }
                ]
              }
            ])
          : undefined,
      };
      const res = await userService.getViewsPagedWithFilter(request);
      setAllUsers(res.data || []);
      return res.data || [];
    } catch (e) {
      console.error(e);
      setAllUsers([]);
      return [];
    } finally {
      setLoadingAllUsers(false);
    }
  }

  async function openAssignUsers(r: any) {
    setSelectedRoleForAssign(r);
    setAssignUsersModalOpen(true);
    // preload a page of users (empty query = default list)
    await fetchUsers('');
    if (r && r.authority) {
      const assigned = await fetchUsersForRole(r.authority);
      setSelectedUserAssignIds((assigned || []).map((u: any) => u.id));
    } else {
      setSelectedUserAssignIds([]);
    }
  }

  async function submitAssignUsers() {
    if (!selectedRoleForAssign) { messageService.error('Vui lòng chọn vai trò'); return; }
    try {
      await rolePermissionService.assignUsersToRole(selectedRoleForAssign.id, selectedUserAssignIds);
      messageService.success('Đã gán người dùng cho vai trò');
      setAssignUsersModalOpen(false);
      // refresh roles and users modal
      await fetchRoles();
      if (selectedRoleForAssign && selectedRoleForAssign.authority) fetchUsersForRole(selectedRoleForAssign.authority);
    } catch (e:any) { console.error(e); messageService.error(e?.message || 'Lỗi'); }
  }

  const permCols = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Tài nguyên', dataIndex: 'resource', key: 'resource' },
    { title: 'Hành động', dataIndex: 'action', key: 'action' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Thao tác', key: 'actions', render: (_: any, p: any) => (
      <Space>
        <Button size="small" onClick={() => openEditPerm(p)}>Sửa</Button>
        <Popconfirm title="Xóa quyền này?" onConfirm={() => deletePerm(p.id)}>
          <Button size="small" danger>Xóa</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Vai trò và quyền hệ thống</h2>

      <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k)}>
        <Tabs.TabPane key="roles" tab="Vai trò (Roles)">
          <Space style={{ marginBottom: 12 }}>
            <Button type="primary" onClick={openCreateRole}>Tạo vai trò</Button>
            <Button onClick={fetchRoles}>Làm mới</Button>
          </Space>
          <Table rowKey="id" dataSource={roles} columns={roleCols} loading={loadingRoles} pagination={{ pageSize: 10 }} />
        </Tabs.TabPane>

        <Tabs.TabPane key="permissions" tab="Quyền (Permissions)">
          <Space style={{ marginBottom: 12 }}>
            <Button type="primary" onClick={openCreatePerm}>Tạo quyền</Button>
            <Button onClick={fetchPerms}>Làm mới</Button>
          </Space>
          <Table rowKey="id" dataSource={permissions} columns={permCols} loading={loadingPerms} pagination={{ pageSize: 10 }} />
        </Tabs.TabPane>

        <Tabs.TabPane key="assign" tab="Gán quyền cho vai trò">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 300 }}>
                <div style={{ marginBottom: 12 }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn vai trò"
                    value={selectedRoleId ?? undefined}
                    onChange={(v) => onRoleSelect(v ?? null)}
                    options={(roles || []).map(r => ({ label: r.authority || r.name || `#${r.id}`, value: r.id }))}
                  />
                </div>
                <div>
                  <Button onClick={() => { onRoleSelect(null); setSelectedPermissionIds([]); }}>Xóa</Button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 12 }}>
                  <strong>Danh sách quyền</strong>
                </div>

                {/* Group permissions by resource and render in two equal columns. */}
                {(() => {
                  // Build map: resource -> action -> permissionId
                  const actionOrder = ['READ', 'CREATE', 'UPDATE', 'DELETE'];
                  const resourceMap: Record<string, Record<string, number | null>> = {};
                  (permissions || []).forEach((p: any) => {
                    if (!resourceMap[p.resource]) resourceMap[p.resource] = {};
                    resourceMap[p.resource][p.action] = p.id;
                  });

                  // If a resource has a MANAGE permission, treat it as covering all CRUD actions
                  // so roles that only have MANAGE will appear to have READ/CREATE/UPDATE/DELETE.
                  Object.keys(resourceMap).forEach(res => {
                    const manageId = resourceMap[res]['MANAGE'];
                    if (manageId) {
                      ['READ','CREATE','UPDATE','DELETE'].forEach(a => {
                        if (!resourceMap[res][a]) resourceMap[res][a] = manageId;
                      });
                    }
                  });

                  const resources = Object.keys(resourceMap).sort();

                  // chunk resources into rows of 2 columns
                  const rows: string[][] = [];
                  for (let i = 0; i < resources.length; i += 2) {
                    rows.push(resources.slice(i, i + 2));
                  }

                  const togglePermission = (id: number) => {
                    setSelectedPermissionIds(prev => {
                      if (!prev) return [id];
                      if (prev.includes(id)) return prev.filter(x => x !== id);
                      return [...prev, id];
                    });
                  };

                  return (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {rows.map((pair, rowIdx) => (
                        <div key={rowIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {pair.map((resource) => (
                            <div key={resource} style={{ border: '1px solid #e8e8e8', padding: 12, borderRadius: 6 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>{resource}</div>
                              <div style={{ display: 'flex', flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                {actionOrder.map(action => {
                                  const pid = resourceMap[resource][action];
                                  return (
                                    <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Checkbox
                                        checked={!!(pid && selectedPermissionIds.includes(pid))}
                                        disabled={!pid}
                                        onChange={() => { if (pid) togglePermission(pid); }}
                                      />
                                      <span style={{ color: pid ? undefined : '#999' }}>{action}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          {pair.length === 1 && <div />}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div style={{ marginTop: 12 }}>
                  <Space>
                    <Button type="primary" onClick={submitAssignment} loading={assigning}>Lưu</Button>
                    <Button onClick={() => { if (selectedRoleId) onRoleSelect(selectedRoleId); else setSelectedPermissionIds([]); }}>Đặt lại</Button>
                  </Space>
                </div>
              </div>
            </div>
        </Tabs.TabPane>
      </Tabs>

      <Modal title={editingRole ? 'Sửa vai trò' : 'Tạo vai trò'} open={roleModalOpen} onOk={submitRole} onCancel={() => setRoleModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="authority" label="Tên vai trò" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <UsersWithRoleModal
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        users={usersForRole}
        loading={loadingUsers}
        title={selectedRoleForUsers ? `Người dùng với vai trò ${selectedRoleForUsers.authority}` : 'Người dùng'}
      />

      <Modal title={selectedRoleForAssign ? `Gán người dùng cho vai trò ${selectedRoleForAssign.authority}` : 'Gán người dùng'} open={assignUsersModalOpen} onCancel={() => setAssignUsersModalOpen(false)} onOk={submitAssignUsers} width={800}>
        <div>
          <AssignUsersTable
            users={allUsers}
            loading={loadingAllUsers}
            selectedIds={selectedUserAssignIds}
            onSelectionChange={(ids) => setSelectedUserAssignIds(ids)}
            onSearch={(q) => fetchUsers(q)}
          />
        </div>
      </Modal>

      <Modal title={editingPerm ? 'Sửa quyền' : 'Tạo quyền'} open={permModalOpen} onOk={submitPerm} onCancel={() => setPermModalOpen(false)}>
        <Form form={permForm} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="resource" label="Tài nguyên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="action" label="Hành động" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
