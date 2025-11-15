package com.example.quiz.controller;

import com.example.quiz.model.entity.role_permission.Permission;
import com.example.quiz.model.entity.role_permission.Role;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.service.impl.RolePermissionServiceImpl;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/role-permissions")
@ResourceController("ROLE_PERMISSION")
@RequiredArgsConstructor
@Slf4j
public class RolePermissionController {

    private final RolePermissionServiceImpl service;

    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return service.getAllRoles();
    }

    @PostMapping("/roles")
    public Role createRole(@RequestParam String authority, @RequestParam(required = false) String description) {
        return service.createRole(authority, description);
    }

    @PutMapping("/roles/{id}")
    public Role updateRole(@PathVariable Long id, @RequestParam String authority, @RequestParam(required = false) String description) {
        return service.updateRole(id, authority, description);
    }

    @DeleteMapping("/roles/{id}")
    public void deleteRole(@PathVariable Long id) {
        service.deleteRole(id);
    }

    @GetMapping("/permissions")
    public List<Permission> getAllPermissions() {
        return service.getAllPermissions();
    }

    @PostMapping("/permissions")
    public Permission createPermission(@RequestParam String name, @RequestParam String description, @RequestParam String resource, @RequestParam String action) {
        return service.createPermission(name, description, resource, action);
    }

    @PutMapping("/permissions/{id}")
    public Permission updatePermission(@PathVariable Long id, @RequestParam String name, @RequestParam String description, @RequestParam String resource, @RequestParam String action) {
        return service.updatePermission(id, name, description, resource, action);
    }

    @DeleteMapping("/permissions/{id}")
    public void deletePermission(@PathVariable Long id) {
        service.deletePermission(id);
    }

    @PostMapping("/roles/{roleId}/permissions")
    public void assignPermissionsToRole(@PathVariable Long roleId, @RequestBody Set<Long> permissionIds) {
        service.assignPermissionsToRole(roleId, permissionIds);
    }

    @PostMapping("/roles/{roleId}/users/{userId}")
    public void assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        service.assignRoleToUser(userId, roleId);
    }

    @PostMapping("/roles/{roleId}/users")
    public void assignUsersToRole(@PathVariable Long roleId, @RequestBody Set<Long> userIds) {
        // reuse service.assignRoleToUser for each user
        if (userIds == null || userIds.isEmpty()) return;
        userIds.forEach(userId -> service.assignRoleToUser(userId, roleId));
    }

    @GetMapping("/roles/{authority}/users")
    public List<User> getUsersByRole(@PathVariable String authority) {
        return service.getUsersByRole(authority);
    }
}
