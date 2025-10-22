package com.example.quiz.base.baseInterface;

import com.example.quiz.model.dto.request.RequestPagingDto;
import com.example.quiz.model.dto.response.PagingResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BaseService<E, ID, R, P, V> {
    P create(R request);

    P update(ID id, R request);

    P getById(ID id);

    Page<P> getAll(Pageable pageable);

    void delete(ID id);

    E findById(ID id);

    Page<P> findAll(Pageable pageable);

    void deleteById(ID id);

    // View operations
    V getViewById(ID id);

    Page<V> getViewPaging(Pageable pageable);

    // Additional common operations (optional)
    List<P> findAll();

    Optional<E> findEntityById(ID id);

    // Advanced filtering for views
    PagingResponseDto<Map<String, Object>> getViewPagingWithFilter(RequestPagingDto request);

    // Build hierarchical tree from entities that have a parentId field
    // Returns a list of nodes in Map format as flat list
    // If request has filter, returns matched nodes + all ancestors
    // If request is null or has no filter, returns all nodes (if <=1000) or roots only (if >1000)
    List<Map<String, Object>> getTree(RequestPagingDto request);

    // Return direct children of a given parent id (one level)
    List<Map<String, Object>> getChildren(Object parentId);

    // Validation methods
    boolean validate(ID id);

    void validateBeforeCreate(R request);

    void validateBeforeUpdate(ID id, R request);

    void validateBeforeDelete(ID id);

    void beforeCreate(R request);

    void afterCreate(E entity, P response, R request);

    void beforeUpdate(ID id, R request, E existingEntity);

    void afterUpdate(E entity, P response, R request);

    void beforeDelete(ID id, E existingEntity);

    void afterDelete(ID id, E deletedEntitySnapshot);
}
