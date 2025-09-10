package com.example.quiz.service.impl;

import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.model.entity.Permission;
import com.example.quiz.model.entity.Role;
import com.example.quiz.model.entity.User;
import com.example.quiz.repository.PermissionRepository;
import com.example.quiz.repository.RoleRepository;
import com.example.quiz.repository.UserRepository;
import com.example.quiz.service.interfaces.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Override
    public Role createRole(String authority, String description) {
        if (roleRepository.findByAuthority(authority).isPresent()) {
            throw new AppException(ErrorCode.ENTITY_EXISTED);
        }
        
        Role role = new Role(authority, description);
        return roleRepository.save(role);
    }

    @Override
    public Role getRoleByAuthority(String authority) {
        return roleRepository.findByAuthority(authority)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role updateRole(Long roleId, String authority, String description) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        // Check if authority is already taken by another role
        roleRepository.findByAuthority(authority)
                .filter(r -> !r.getId().equals(roleId))
                .ifPresent(r -> {
                    throw new AppException(ErrorCode.ENTITY_EXISTED);
                });
        
        role.setAuthority(authority);
        role.setDescription(description);
        return roleRepository.save(role);
    }

    @Override
    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        roleRepository.delete(role);
    }

    @Override
    public Permission createPermission(String name, String description, String resource, String action) {
        if (permissionRepository.findByName(name).isPresent()) {
            throw new AppException(ErrorCode.ENTITY_EXISTED);
        }
        
        Permission permission = new Permission(name, description, resource, action);
        return permissionRepository.save(permission);
    }

    @Override
    public Permission getPermissionByName(String name) {
        return permissionRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
    }

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public List<Permission> getPermissionsByResource(String resource) {
        return permissionRepository.findByResource(resource);
    }

    @Override
    public Permission updatePermission(Long permissionId, String name, String description, String resource, String action) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        // Check if name is already taken by another permission
        permissionRepository.findByName(name)
                .filter(p -> !p.getId().equals(permissionId))
                .ifPresent(p -> {
                    throw new AppException(ErrorCode.ENTITY_EXISTED);
                });
        
        permission.setName(name);
        permission.setDescription(description);
        permission.setResource(resource);
        permission.setAction(action);
        return permissionRepository.save(permission);
    }

    @Override
    public void deletePermission(Long permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        permissionRepository.delete(permission);
    }

    @Override
    public void assignPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        role.getPermissions().add(permission);
        roleRepository.save(role);
    }

    @Override
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        role.getPermissions().remove(permission);
        roleRepository.save(role);
    }

    @Override
    public void assignPermissionsToRole(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        Set<Permission> permissions = permissionIds.stream()
                .map(id -> permissionRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED)))
                .collect(Collectors.toSet());
        
        role.setPermissions(permissions);
        roleRepository.save(role);
    }

    @Override
    public void removeAllPermissionsFromRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        role.getPermissions().clear();
        roleRepository.save(role);
    }

    @Override
    public void assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        user.getAuthorities().add(role);
        userRepository.save(user);
    }

    @Override
    public void removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        user.getAuthorities().remove(role);
        userRepository.save(user);
    }

    @Override
    public void assignRolesToUser(Long userId, Set<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        Set<Role> roles = roleIds.stream()
                .map(id -> roleRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED)))
                .collect(Collectors.toSet());
        
        user.setAuthorities(roles);
        userRepository.save(user);
    }

    @Override
    public void removeAllRolesFromUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        user.getAuthorities().clear();
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getUserRoles(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        return user.getAuthorities().stream().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getUserPermissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        return user.getAuthorities().stream()
                .flatMap(role -> role.getPermissions().stream())
                .distinct()
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String authority) {
        Role role = roleRepository.findByAuthority(authority)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        return role.getUsers().stream().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean userHasRole(Long userId, String authority) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        return user.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals(authority));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean userHasPermission(Long userId, String resource, String action) {
        List<Permission> userPermissions = getUserPermissions(userId);
        
        return userPermissions.stream()
                .anyMatch(permission -> 
                    permission.getResource().equals(resource) && 
                    (permission.getAction().equals(action) || permission.getAction().equals("MANAGE"))
                );
    }
}
