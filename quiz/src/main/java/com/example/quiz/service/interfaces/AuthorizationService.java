package com.example.quiz.service.interfaces;

import com.example.quiz.model.entity.Permission;
import com.example.quiz.model.entity.Role;

import java.util.List;

/**
 * Interface for Authorization Service
 * Provides methods for checking user permissions and roles
 */
public interface AuthorizationService {

    /**
     * Check if current user has specific permission
     * @param resource the resource name (e.g., "USER", "QUIZ")
     * @param action the action name (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     * @return true if user has permission, false otherwise
     */
    boolean hasPermission(String resource, String action);

    /**
     * Check if specified user has specific permission
     * @param username the username to check
     * @param resource the resource name (e.g., "USER", "QUIZ")
     * @param action the action name (e.g., "CREATE", "READ", "UPDATE", "DELETE")
     * @return true if user has permission, false otherwise
     */
    boolean hasPermission(String username, String resource, String action);

    /**
     * Check if current user has any of the specified roles
     * @param roles array of role names to check
     * @return true if user has any of the specified roles, false otherwise
     */
    boolean hasAnyRole(String[] roles);

    /**
     * Check if specified user has any of the specified roles
     * @param username the username to check
     * @param roles array of role names to check
     * @return true if user has any of the specified roles, false otherwise
     */
    boolean hasAnyRole(String username, String[] roles);

    /**
     * Get all permissions for current user
     * @return list of permissions for current user
     */
    List<Permission> getCurrentUserPermissions();

    /**
     * Get all roles for current user
     * @return list of roles for current user
     */
    List<Role> getCurrentUserRoles();

    /**
     * Check if current user is admin (has ADMIN or SUPER_ADMIN role)
     * @return true if user is admin, false otherwise
     */
    boolean isAdmin();

    /**
     * Check if current user can access resource (has READ or MANAGE permission)
     * @param resource the resource name to check
     * @return true if user can access resource, false otherwise
     */
    boolean canAccessResource(String resource);

    /**
     * Check if current user can modify resource (has CREATE, UPDATE, DELETE, or MANAGE permission)
     * @param resource the resource name to check
     * @return true if user can modify resource, false otherwise
     */
    boolean canModifyResource(String resource);

    /**
     * Get permissions for specified user
     * @param username the username to get permissions for
     * @return list of permissions for the user
     */
    List<Permission> getUserPermissions(String username);

    /**
     * Get roles for specified user
     * @param username the username to get roles for
     * @return list of roles for the user
     */
    List<Role> getUserRoles(String username);

    /**
     * Check if specified user is admin
     * @param username the username to check
     * @return true if user is admin, false otherwise
     */
    boolean isAdmin(String username);

    /**
     * Check if specified user can access resource
     * @param username the username to check
     * @param resource the resource name to check
     * @return true if user can access resource, false otherwise
     */
    boolean canAccessResource(String username, String resource);

    /**
     * Check if specified user can modify resource
     * @param username the username to check
     * @param resource the resource name to check
     * @return true if user can modify resource, false otherwise
     */
    boolean canModifyResource(String username, String resource);
}
