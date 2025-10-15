package com.example.quiz.controller;

import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.entity.role_permission.Permission;
import com.example.quiz.model.entity.role_permission.Role;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.service.interfaces.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPER_ADMIN')")
public class AdminController {

    private final RolePermissionService rolePermissionService;

    // Role Management
    @GetMapping("/roles")
    @RequirePermission(resource = "ROLE", action = "READ")
    public ApiResponse<List<Role>> getAllRoles() {
        return ApiResponse.successOf(rolePermissionService.getAllRoles());
    }

    @GetMapping("/roles/{authority}")
    @RequirePermission(resource = "ROLE", action = "READ")
    public ApiResponse<Role> getRoleByAuthority(@PathVariable String authority) {
        return ApiResponse.successOf(rolePermissionService.getRoleByAuthority(authority));
    }

    @PostMapping("/roles")
    @RequirePermission(resource = "ROLE", action = "CREATE")
    public ApiResponse<Role> createRole(@RequestParam String authority, @RequestParam String description) {
        return ApiResponse.successOf(rolePermissionService.createRole(authority, description));
    }

    @PutMapping("/roles/{roleId}")
    @RequirePermission(resource = "ROLE", action = "UPDATE")
    public ApiResponse<Role> updateRole(@PathVariable Long roleId, @RequestParam String authority, @RequestParam String description) {
        return ApiResponse.successOf(rolePermissionService.updateRole(roleId, authority, description));
    }

    @DeleteMapping("/roles/{roleId}")
    @RequirePermission(resource = "ROLE", action = "DELETE")
    public ApiResponse<Void> deleteRole(@PathVariable Long roleId) {
        rolePermissionService.deleteRole(roleId);
        return ApiResponse.successOf(null);
    }

    // Permission Management
    @GetMapping("/permissions")
    @RequirePermission(resource = "PERMISSION", action = "READ")
    public ApiResponse<List<Permission>> getAllPermissions() {
        return ApiResponse.successOf(rolePermissionService.getAllPermissions());
    }

    @GetMapping("/permissions/{name}")
    @RequirePermission(resource = "PERMISSION", action = "READ")
    public ApiResponse<Permission> getPermissionByName(@PathVariable String name) {
        return ApiResponse.successOf(rolePermissionService.getPermissionByName(name));
    }

    @GetMapping("/permissions/resource/{resource}")
    @RequirePermission(resource = "PERMISSION", action = "READ")
    public ApiResponse<List<Permission>> getPermissionsByResource(@PathVariable String resource) {
        return ApiResponse.successOf(rolePermissionService.getPermissionsByResource(resource));
    }

    @PostMapping("/permissions")
    @RequirePermission(resource = "PERMISSION", action = "CREATE")
    public ApiResponse<Permission> createPermission(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String resource,
            @RequestParam String action) {
        return ApiResponse.successOf(rolePermissionService.createPermission(name, description, resource, action));
    }

    @PutMapping("/permissions/{permissionId}")
    @RequirePermission(resource = "PERMISSION", action = "UPDATE")
    public ApiResponse<Permission> updatePermission(
            @PathVariable Long permissionId,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String resource,
            @RequestParam String action) {
        return ApiResponse.successOf(rolePermissionService.updatePermission(permissionId, name, description, resource, action));
    }

    @DeleteMapping("/permissions/{permissionId}")
    @RequirePermission(resource = "PERMISSION", action = "DELETE")
    public ApiResponse<Void> deletePermission(@PathVariable Long permissionId) {
        rolePermissionService.deletePermission(permissionId);
        return ApiResponse.successOf(null);
    }

    // Role-Permission Assignment
    @PostMapping("/roles/{roleId}/permissions/{permissionId}")
    @RequirePermission(resource = "ROLE", action = "UPDATE")
    public ApiResponse<Void> assignPermissionToRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        rolePermissionService.assignPermissionToRole(roleId, permissionId);
        return ApiResponse.successOf(null);
    }

    @DeleteMapping("/roles/{roleId}/permissions/{permissionId}")
    @RequirePermission(resource = "ROLE", action = "UPDATE")
    public ApiResponse<Void> removePermissionFromRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        rolePermissionService.removePermissionFromRole(roleId, permissionId);
        return ApiResponse.successOf(null);
    }

    @PutMapping("/roles/{roleId}/permissions")
    @RequirePermission(resource = "ROLE", action = "UPDATE")
    public ApiResponse<Void> assignPermissionsToRole(@PathVariable Long roleId, @RequestBody Set<Long> permissionIds) {
        rolePermissionService.assignPermissionsToRole(roleId, permissionIds);
        return ApiResponse.successOf(null);
    }

    // User-Role Assignment
    @PostMapping("/users/{userId}/roles/{roleId}")
    @RequirePermission(resource = "USER", action = "UPDATE")
    public ApiResponse<Void> assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        rolePermissionService.assignRoleToUser(userId, roleId);
        return ApiResponse.successOf(null);
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @RequirePermission(resource = "USER", action = "UPDATE")
    public ApiResponse<Void> removeRoleFromUser(@PathVariable Long userId, @PathVariable Long roleId) {
        rolePermissionService.removeRoleFromUser(userId, roleId);
        return ApiResponse.successOf(null);
    }

    @PutMapping("/users/{userId}/roles")
    @RequirePermission(resource = "USER", action = "UPDATE")
    public ApiResponse<Void> assignRolesToUser(@PathVariable Long userId, @RequestBody Set<Long> roleIds) {
        rolePermissionService.assignRolesToUser(userId, roleIds);
        return ApiResponse.successOf(null);
    }

    // Utility endpoints
    @GetMapping("/users/{userId}/roles")
    @RequirePermission(resource = "USER", action = "READ")
    public ApiResponse<List<Role>> getUserRoles(@PathVariable Long userId) {
        return ApiResponse.successOf(rolePermissionService.getUserRoles(userId));
    }

    @GetMapping("/users/{userId}/permissions")
    @RequirePermission(resource = "USER", action = "READ")
    public ApiResponse<List<Permission>> getUserPermissions(@PathVariable Long userId) {
        return ApiResponse.successOf(rolePermissionService.getUserPermissions(userId));
    }

    @GetMapping("/roles/{authority}/users")
    @RequirePermission(resource = "USER", action = "READ")
    public ApiResponse<List<User>> getUsersByRole(@PathVariable String authority) {
        return ApiResponse.successOf(rolePermissionService.getUsersByRole(authority));
    }

    @GetMapping("/users/{userId}/has-role/{authority}")
    @RequirePermission(resource = "USER", action = "READ")
    public ApiResponse<Boolean> userHasRole(@PathVariable Long userId, @PathVariable String authority) {
        return ApiResponse.successOf(rolePermissionService.userHasRole(userId, authority));
    }

    @GetMapping("/users/{userId}/has-permission")
    @RequirePermission(resource = "USER", action = "READ")
    public ApiResponse<Boolean> userHasPermission(
            @PathVariable Long userId,
            @RequestParam String resource,
            @RequestParam String action) {
        return ApiResponse.successOf(rolePermissionService.userHasPermission(userId, resource, action));
    }
}
