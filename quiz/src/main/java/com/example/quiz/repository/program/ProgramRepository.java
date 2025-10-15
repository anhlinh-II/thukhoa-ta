package com.example.quiz.repository.program;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.program.Program;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramRepository extends BaseRepository<Program, Long> {

    // Find root programs (no parent)
    List<Program> findByParentIsNullAndIsActiveTrueOrderByDisplayOrderAsc();

    // Find children of a specific program
    List<Program> findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(Long parentId);

    // Find all programs by level
    List<Program> findByLevelAndIsActiveTrueOrderByDisplayOrderAsc(Integer level);

    // Check if program exists by name under same parent
    boolean existsByNameAndParentId(String name, Long parentId);
    
    // Check if program exists by name at root level
    boolean existsByNameAndParentIsNull(String name);

    // Find leaf programs (programs without children)
    @Query("SELECT p FROM Program p WHERE p.isActive = true AND " +
           "NOT EXISTS (SELECT c FROM Program c WHERE c.parent = p AND c.isActive = true)")
    List<Program> findLeafPrograms();

    // Get program hierarchy path
    @Query(value = "WITH RECURSIVE program_path AS (" +
           "    SELECT id, name, parent_id, name as path, 0 as depth " +
           "    FROM programs WHERE id = :programId " +
           "    UNION ALL " +
           "    SELECT p.id, p.name, p.parent_id, CONCAT(p.name, ' > ', pp.path), pp.depth + 1 " +
           "    FROM programs p " +
           "    INNER JOIN program_path pp ON p.id = pp.parent_id " +
           ") " +
           "SELECT path FROM program_path WHERE parent_id IS NULL",
           nativeQuery = true)
    Optional<String> findProgramPath(@Param("programId") Long programId);

    // Validate hierarchy (prevent circular references)
    @Query(value = "WITH RECURSIVE program_hierarchy AS (" +
           "    SELECT id, parent_id, 1 as level " +
           "    FROM programs WHERE id = :programId " +
           "    UNION ALL " +
           "    SELECT p.id, p.parent_id, ph.level + 1 " +
           "    FROM programs p " +
           "    INNER JOIN program_hierarchy ph ON p.parent_id = ph.id " +
           "    WHERE ph.level < 10 " +
           ") " +
           "SELECT COUNT(*) FROM program_hierarchy WHERE id = :ancestorId",
           nativeQuery = true)
    int checkCircularReference(@Param("programId") Long programId, @Param("ancestorId") Long ancestorId);
}
