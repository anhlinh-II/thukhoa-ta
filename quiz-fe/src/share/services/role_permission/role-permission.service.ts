import apiClient from '../api';
import { ENV } from '../../utils/env';

const BASE = `${ENV.API_URL}/role-permissions`;

function unwrapApiResponse(resp: any) {
  if (resp && typeof resp === 'object' && 'code' in resp && 'result' in resp) {
    if (resp.code !== 1000) throw new Error(resp.message || 'API error');
    return resp.result;
  }
  return resp;
}

export const rolePermissionService = {
  // Roles
  async getAllRoles() {
    const r = await apiClient.get(`${BASE}/roles`);
    return unwrapApiResponse(r.data);
  },

  async createRole(authority: string, description?: string) {
    const params: Record<string, any> = { authority };
    if (description) params.description = description;
    const r = await apiClient.post(`${BASE}/roles`, null, { params });
    return unwrapApiResponse(r.data);
  },

  async updateRole(id: number, authority: string, description?: string) {
    const params: Record<string, any> = { authority };
    if (description) params.description = description;
    const r = await apiClient.put(`${BASE}/roles/${id}`, null, { params });
    return unwrapApiResponse(r.data);
  },

  async deleteRole(id: number) {
    const r = await apiClient.delete(`${BASE}/roles/${id}`);
    return unwrapApiResponse(r.data);
  },

  // Permissions
  async getAllPermissions() {
    const r = await apiClient.get(`${BASE}/permissions`);
    return unwrapApiResponse(r.data);
  },

  async createPermission(name: string, description: string, resource: string, action: string) {
    const params = { name, description, resource, action };
    const r = await apiClient.post(`${BASE}/permissions`, null, { params });
    return unwrapApiResponse(r.data);
  },

  async updatePermission(id: number, name: string, description: string, resource: string, action: string) {
    const params = { name, description, resource, action };
    const r = await apiClient.put(`${BASE}/permissions/${id}`, null, { params });
    return unwrapApiResponse(r.data);
  },

  async deletePermission(id: number) {
    const r = await apiClient.delete(`${BASE}/permissions/${id}`);
    return unwrapApiResponse(r.data);
  },

  // Assign
  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    const r = await apiClient.post(`${BASE}/roles/${roleId}/permissions`, permissionIds);
    return unwrapApiResponse(r.data);
  },

  async assignRoleToUser(userId: number, roleId: number) {
    const r = await apiClient.post(`${BASE}/roles/${roleId}/users/${userId}`);
    return unwrapApiResponse(r.data);
  },

  async assignUsersToRole(roleId: number, userIds: number[]) {
    const r = await apiClient.post(`${BASE}/roles/${roleId}/users`, userIds);
    return unwrapApiResponse(r.data);
  },

  async getUsersByRole(authority: string) {
    const r = await apiClient.get(`${BASE}/roles/${encodeURIComponent(authority)}/users`);
    return unwrapApiResponse(r.data);
  },
};
