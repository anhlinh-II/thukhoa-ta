package com.example.quiz.base.baseInterface;

import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

/**
 * Optional interface for view repositories that manage tree-structured views.
 * Only implement this if your view has a parentId field.
 * 
 * Example:
 * public interface ProgramViewRepository extends JpaRepository<ProgramView, Long>, TreeViewRepository<ProgramView, Long> {
 * }
 */
@NoRepositoryBean
public interface TreeViewRepository<V, ID> {
    
    /**
     * Find all root nodes (where parentId is null)
     */
    List<V> findAllByParentIdIsNull();
    
    /**
     * Find direct children of a parent node.
     * Note: This method accepts Object to support different parent ID types.
     */
    default List<V> findAllByParentId(Object parentId) {
        // Default implementation will be overridden by Spring Data JPA
        throw new UnsupportedOperationException("findAllByParentId must be implemented by Spring Data JPA");
    }
    
    /**
     * Count children of a parent node.
     * Note: This method accepts Object to support different parent ID types.
     */
    default long countByParentId(Object parentId) {
        // Default implementation - subclasses should override
        if (parentId == null) return 0;
        
        if (parentId instanceof Number) {
            // Try to call the typed version if available via reflection
            try {
                var method = this.getClass().getMethod("countByParentIdAndIsActiveTrue", parentId.getClass());
                Object result = method.invoke(this, parentId);
                return result instanceof Number ? ((Number) result).longValue() : 0;
            } catch (Exception e) {
                // Fallback: just return 1 to indicate "might have children"
                return 1;
            }
        }
        
        return 0;
    }
}
