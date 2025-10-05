package com.example.quiz.base.baseInterface;

import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

/**
 * Optional interface for repositories that manage tree-structured entities.
 * Only implement this if your entity has a parentId field.
 * 
 * Example:
 * public interface ProgramRepository extends BaseRepository<Program, Long>, TreeRepository<Program, Long> {
 * }
 */
@NoRepositoryBean
public interface TreeRepository<T, ID> {
    
    /**
     * Find all root nodes (where parentId is null)
     */
    List<T> findAllByParentIdIsNull();
    
    /**
     * Find direct children of a parent node
     */
    List<T> findAllByParentId(ID parentId);
    
    /**
     * Count children of a parent node
     */
    long countByParentId(ID parentId);
}
