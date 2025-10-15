package com.example.quiz.repository.program;

import com.example.quiz.base.baseInterface.TreeViewRepository;
import com.example.quiz.model.entity.program.ProgramView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramViewRepository extends JpaRepository<ProgramView, Long>, TreeViewRepository<ProgramView, Long> {

    // ========== TreeViewRepository Implementation ==========
    
    /**
     * Find all root programs (implements TreeViewRepository)
     */
    @Override
    List<ProgramView> findAllByParentIdIsNull();
    
    /**
     * Override to support different types and filter by isActive
     */
    @Override
    default List<ProgramView> findAllByParentId(Object parentId) {
        if (parentId == null) return findAllByParentIdIsNull();
        if (parentId instanceof Long) {
            return findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc((Long) parentId);
        }
        if (parentId instanceof Number) {
            return findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(((Number) parentId).longValue());
        }
        if (parentId instanceof String) {
            try {
                return findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(Long.parseLong((String) parentId));
            } catch (NumberFormatException e) {
                return List.of();
            }
        }
        return List.of();
    }
    
    /**
     * Override to use isActive filter
     */
    @Override
    default long countByParentId(Object parentId) {
        if (parentId == null) return 0;
        if (parentId instanceof Long) {
            return countByParentIdAndIsActiveTrue((Long) parentId);
        }
        if (parentId instanceof Number) {
            return countByParentIdAndIsActiveTrue(((Number) parentId).longValue());
        }
        if (parentId instanceof String) {
            try {
                return countByParentIdAndIsActiveTrue(Long.parseLong((String) parentId));
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }
    
    // ========== Program-Specific Queries ==========
    
    // Find root programs filtered by isActive
    List<ProgramView> findByParentIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc();

    // Find children of a specific program
    List<ProgramView> findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(Long parentId);

    // Count children (for hasChildren flag)
    long countByParentIdAndIsActiveTrue(Long parentId);

    // Find programs by level
    List<ProgramView> findByLevelAndIsActiveTrueOrderByDisplayOrderAsc(Integer level);

    // Helper: find all active programs ordered
    List<ProgramView> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Find leaf programs only (computed): default implementation that
    // uses child count to determine leafness instead of relying on a
    // non-existent `isLeaf` property on the view.
    default List<ProgramView> findByIsLeafTrueAndIsActiveTrueOrderByDisplayOrderAsc() {
        List<ProgramView> allActive = findByIsActiveTrueOrderByDisplayOrderAsc();
        List<ProgramView> leaves = new java.util.ArrayList<>();
        for (ProgramView pv : allActive) {
            Long id = pv.getId();
            if (id == null) continue;
            long childCount = countByParentIdAndIsActiveTrue(id);
            if (childCount == 0) {
                leaves.add(pv);
            }
        }
        return leaves;
    }

    // Search programs by name
    @Query("SELECT pv FROM ProgramView pv WHERE pv.isActive = true AND " +
           "LOWER(pv.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "ORDER BY pv.displayOrder ASC")
    List<ProgramView> findByNameContainingIgnoreCase(@Param("name") String name);

    // Get program hierarchy tree starting from a specific program
    @Query("SELECT pv FROM ProgramView pv WHERE pv.isActive = true AND " +
           "(pv.id = :programId OR pv.path LIKE CONCAT('%', :programId, '%')) " +
           "ORDER BY pv.depth, pv.displayOrder")
    List<ProgramView> findHierarchyTree(@Param("programId") Long programId);
}
