package com.example.quiz.service.interfaces;

import com.example.quiz.model.entity.Permission;
import com.example.quiz.model.entity.Role;
import com.example.quiz.model.entity.User;

import java.util.List;
import java.util.Set;

public interface RolePermissionService {
    
    // Role management
    Role createRole(String authority, String description);
    Role getRoleByAuthority(String authority);
    List<Role> getAllRoles();
    Role updateRole(Long roleId, String authority, String description);
    void deleteRole(Long roleId);
    
    // Permission management
    Permission createPermission(String name, String description, String resource, String action);
    Permission getPermissionByName(String name);
    List<Permission> getAllPermissions();
    List<Permission> getPermissionsByResource(String resource);
    Permission updatePermission(Long permissionId, String name, String description, String resource, String action);
    void deletePermission(Long permissionId);
    
    // Role-Permission assignment
    void assignPermissionToRole(Long roleId, Long permissionId);
    void removePermissionFromRole(Long roleId, Long permissionId);
    void assignPermissionsToRole(Long roleId, Set<Long> permissionIds);
    void removeAllPermissionsFromRole(Long roleId);
    
    // User-Role assignment
    void assignRoleToUser(Long userId, Long roleId);
    void removeRoleFromUser(Long userId, Long roleId);
    void assignRolesToUser(Long userId, Set<Long> roleIds);
    void removeAllRolesFromUser(Long userId);
    
    // Utility methods
    List<Role> getUserRoles(Long userId);
    List<Permission> getUserPermissions(Long userId);
    List<User> getUsersByRole(String authority);
    boolean userHasRole(Long userId, String authority);
    boolean userHasPermission(Long userId, String resource, String action);
}
