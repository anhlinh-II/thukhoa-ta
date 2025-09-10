package com.example.quiz.repository;

import com.example.quiz.model.view.ProgramView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramViewRepository extends JpaRepository<ProgramView, Long> {

    // Find root programs with hierarchy info
    List<ProgramView> findByParentIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc();

    // Find children of a specific program
    List<ProgramView> findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(Long parentId);

    // Find programs by level
    List<ProgramView> findByLevelAndIsActiveTrueOrderByDisplayOrderAsc(Integer level);

    // Find leaf programs only
    List<ProgramView> findByIsLeafTrueAndIsActiveTrueOrderByDisplayOrderAsc();

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
