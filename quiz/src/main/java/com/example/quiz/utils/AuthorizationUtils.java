package com.example.quiz.utils;

import com.example.quiz.service.interfaces.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Utility class for Authorization operations
 * Provides easy access to authorization checking methods
 */
@Component
@RequiredArgsConstructor
public class AuthorizationUtils {

    private final AuthorizationService authorizationService;

    /**
     * Check if current user has permission
     */
    public boolean hasPermission(String resource, String action) {
        return authorizationService.hasPermission(resource, action);
    }

    /**
     * Check if current user has any role
     */
    public boolean hasAnyRole(String... roles) {
        return authorizationService.hasAnyRole(roles);
    }

    /**
     * Check if current user is admin
     */
    public boolean isAdmin() {
        return authorizationService.isAdmin();
    }

    /**
     * Check if current user can access resource
     */
    public boolean canAccess(String resource) {
        return authorizationService.canAccessResource(resource);
    }

    /**
     * Check if current user can modify resource
     */
    public boolean canModify(String resource) {
        return authorizationService.canModifyResource(resource);
    }

    /**
     * Check if user has permission
     */
    public boolean userHasPermission(String username, String resource, String action) {
        return authorizationService.hasPermission(username, resource, action);
    }

    /**
     * Check if user has any role
     */
    public boolean userHasAnyRole(String username, String... roles) {
        return authorizationService.hasAnyRole(username, roles);
    }

    /**
     * Check if user is admin
     */
    public boolean userIsAdmin(String username) {
        return authorizationService.isAdmin(username);
    }
}
