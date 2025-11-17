package com.example.quiz.repository.role_permission;

import com.example.quiz.model.entity.role_permission.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByAuthority(String authority);
    
    @Query("SELECT r FROM Role r JOIN FETCH r.permissions WHERE r.authority = :authority")
    Optional<Role> findByAuthorityWithPermissions(@Param("authority") String authority);
    
    @Query("SELECT DISTINCT r FROM Role r " +
           "JOIN FETCH r.permissions " +
           "JOIN r.users u " +
           "WHERE u.username = :username")
    List<Role> findRolesByUsernameWithPermissions(@Param("username") String username);

    @Query("SELECT DISTINCT r FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<Role> findRolesByPermissionId(@Param("permissionId") Long permissionId);
}
