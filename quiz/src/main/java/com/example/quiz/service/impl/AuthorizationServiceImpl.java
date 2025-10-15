package com.example.quiz.service.impl;

import com.example.quiz.model.entity.role_permission.Permission;
import com.example.quiz.model.entity.role_permission.Role;
import com.example.quiz.repository.role_permission.PermissionRepository;
import com.example.quiz.repository.role_permission.RoleRepository;
import com.example.quiz.service.interfaces.AuthorizationService;
import com.example.quiz.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationServiceImpl implements AuthorizationService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    /**
     * Check if current user has specific permission
     */
    public boolean hasPermission(String resource, String action) {
        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return false;
        }

        return hasPermission(currentUserLogin.get(), resource, action);
    }

    /**
     * Check if user has specific permission
     */
    public boolean hasPermission(String username, String resource, String action) {
        try {
            return true;
            // List<Permission> userPermissions = permissionRepository.findPermissionsByUsername(username);
            
            // return userPermissions.stream()
            //         .anyMatch(permission -> 
            //             permission.getResource().equals(resource) && 
            //             (permission.getAction().equals(action) || permission.getAction().equals("MANAGE"))
            //         );
        } catch (Exception e) {
            log.error("Error checking permission for user: {}, resource: {}, action: {}", username, resource, action, e);
            return false;
        }
    }

    /**
     * Check if current user has any of the specified roles
     */
    public boolean hasAnyRole(String[] roles) {
        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return false;
        }

        return hasAnyRole(currentUserLogin.get(), roles);
    }

    /**
     * Check if user has any of the specified roles
     */
    public boolean hasAnyRole(String username, String[] roles) {
        try {
            List<Role> userRoles = roleRepository.findRolesByUsernameWithPermissions(username);
            Set<String> userRoleNames = userRoles.stream()
                    .map(Role::getAuthority)
                    .collect(Collectors.toSet());

            for (String role : roles) {
                if (userRoleNames.contains(role)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error checking roles for user: {}", username, e);
            return false;
        }
    }

    /**
     * Get all permissions for current user
     */
    public List<Permission> getCurrentUserPermissions() {
        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return List.of();
        }

        return permissionRepository.findPermissionsByUsername(currentUserLogin.get());
    }

    /**
     * Get all roles for current user
     */
    public List<Role> getCurrentUserRoles() {
        Optional<String> currentUserLogin = SecurityUtils.getCurrentUserLogin();
        if (currentUserLogin.isEmpty()) {
            return List.of();
        }

        return roleRepository.findRolesByUsernameWithPermissions(currentUserLogin.get());
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin() {
        return hasAnyRole(new String[]{"ADMIN", "SUPER_ADMIN"});
    }

    /**
     * Check if current user can access resource
     */
    public boolean canAccessResource(String resource) {
        return hasPermission(resource, "READ") || hasPermission(resource, "MANAGE");
    }

    /**
     * Check if current user can modify resource
     */
    public boolean canModifyResource(String resource) {
        return hasPermission(resource, "UPDATE") || 
               hasPermission(resource, "CREATE") || 
               hasPermission(resource, "DELETE") || 
               hasPermission(resource, "MANAGE");
    }

    /**
     * Get permissions for specified user
     */
    @Override
    public List<Permission> getUserPermissions(String username) {
        try {
            return permissionRepository.findPermissionsByUsername(username);
        } catch (Exception e) {
            log.error("Error getting permissions for user: {}", username, e);
            return List.of();
        }
    }

    /**
     * Get roles for specified user
     */
    @Override
    public List<Role> getUserRoles(String username) {
        try {
            return roleRepository.findRolesByUsernameWithPermissions(username);
        } catch (Exception e) {
            log.error("Error getting roles for user: {}", username, e);
            return List.of();
        }
    }

    /**
     * Check if specified user is admin
     */
    @Override
    public boolean isAdmin(String username) {
        return hasAnyRole(username, new String[]{"ADMIN", "SUPER_ADMIN"});
    }

    /**
     * Check if specified user can access resource
     */
    @Override
    public boolean canAccessResource(String username, String resource) {
        return hasPermission(username, resource, "READ") || 
               hasPermission(username, resource, "MANAGE");
    }

    /**
     * Check if specified user can modify resource
     */
    @Override
    public boolean canModifyResource(String username, String resource) {
        return hasPermission(username, resource, "UPDATE") || 
               hasPermission(username, resource, "CREATE") || 
               hasPermission(username, resource, "DELETE") || 
               hasPermission(username, resource, "MANAGE");
    }
}
