package com.example.quiz.repository.role_permission;

import com.example.quiz.model.entity.role_permission.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByName(String name);
    
    List<Permission> findByResource(String resource);
    
    List<Permission> findByAction(String action);
    
    @Query("SELECT p FROM Permission p WHERE p.resource = :resource AND p.action = :action")
    Optional<Permission> findByResourceAndAction(@Param("resource") String resource, @Param("action") String action);
    
    @Query("SELECT DISTINCT p FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.users u " +
           "WHERE u.email = :username")
    List<Permission> findPermissionsByUsername(@Param("username") String username);
}
