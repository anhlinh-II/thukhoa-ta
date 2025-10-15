package com.example.quiz.base.impl;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.model.dto.request.RequestPagingDto;
import com.example.quiz.model.dto.response.PagingResponseDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.Set;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import jakarta.persistence.Id;
import org.springframework.dao.DataIntegrityViolationException;
import com.example.quiz.utils.Sluggable;
import com.example.quiz.utils.SlugService;

@RequiredArgsConstructor
@SuperBuilder
@Slf4j
public abstract class BaseServiceImpl<E, ID, R, P, V> implements BaseService<E, ID, R, P, V> {

    private final AdvancedFilterService advancedFilterService;
    private final BaseRepository<E, ID> repository;
    private final BaseMapstruct<E, R, P, V> mapper;
    private final JpaRepository<V, ID> viewRepository;
    
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Override
    public P create(R request) {
        validateBeforeCreate(request);
        // lifecycle hook
        beforeCreate(request);
        E entity = mapper.requestToEntity(request);
        E savedEntity;
        savedEntity = getSavedEntity(entity);
        P response = mapper.entityToResponse(savedEntity);
        // lifecycle hook after persistence
        afterCreate(savedEntity, response);
        return response;
    }

    private E getSavedEntity(E entity) {
        E savedEntity;
        try {
            savedEntity = repository.save(entity);
        } catch (DataIntegrityViolationException dive) {
            // If the entity is sluggable, try to generate a unique slug and retry once.
            if (entity instanceof Sluggable) {
                Sluggable s = (Sluggable) entity;
                String base = s.computeSlugFromSource();
                if (base != null && !base.isBlank()) {
                    try {
                        // Try to get a repository-backed uniqueness predicate: we will attempt
                        // to call `existsBySlugAndIsDeletedFalse` on the repository if present.
                        java.util.function.Predicate<String> existsPredicate = slug -> {
                            try {
                                Method m = repository.getClass().getMethod("existsBySlugAndIsDeletedFalse", String.class);
                                Object res = m.invoke(repository, slug);
                                if (res instanceof Boolean) return (Boolean) res;
                            } catch (NoSuchMethodException ignored) {
                            } catch (Exception ex) {
                                log.debug("existsBySlug predicate reflection failed: {}", ex.getMessage());
                            }
                            return false;
                        };

                        String unique = SlugService.ensureUniqueSlug(existsPredicate::test, base);
                        s.setSlug(unique);
                        savedEntity = repository.save(entity);
                    } catch (DataIntegrityViolationException dive2) {
                        // give up and rethrow original or new exception
                        throw dive2;
                    }
                } else {
                    throw dive;
                }
            } else {
                throw dive;
            }
        }
        return savedEntity;
    }

    @Override
    public P update(ID id, R request) {
        validateBeforeUpdate(id, request);
    E existingEntity = repository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Entity not found with id: " + id));

    // lifecycle hook before update (allows inspecting existing entity)
    beforeUpdate(id, request, existingEntity);

    mapper.updateEntityFromRequest(request, existingEntity);
    E savedEntity = repository.save(existingEntity);
    P response = mapper.entityToResponse(savedEntity);
    // lifecycle hook after update
    afterUpdate(savedEntity, response);
    return response;
    }

    @Override
    public E findById(ID id) {
        Optional<E> optionalEntity = repository.findById(id);
        if (optionalEntity.isEmpty()) {
            throw new EntityNotFoundException("Entity not found with id: " + id);
        }
        return optionalEntity.get();
    }

    @Override
    public Page<P> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::entityToResponse);
    }

    @Override
    public void deleteById(ID id) {
        validateBeforeDelete(id);
        // fetch entity for hooks and for better error messages
        E existingEntity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entity not found with id: " + id));

        // lifecycle hook before delete
        beforeDelete(id, existingEntity);

        repository.deleteById(id);

        // lifecycle hook after delete
        afterDelete(id, existingEntity);
    }

    @Override
    public V getViewById(ID id) {
        return viewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("View not found with id: " + id));
    }

    @Override
    public Page<V> getViewPaging(Pageable pageable) {
        return viewRepository.findAll(pageable);
    }

    @Override
    public PagingResponseDto<Map<String, Object>> getViewPagingWithFilter(RequestPagingDto request) {
        return advancedFilterService.getFilteredViewData(getViewClass(), request);
    }

    // Abstract method to get the view class - must be implemented by subclasses
    protected abstract Class<V> getViewClass();

    @Override
    public P getById(ID id) {
        return mapper.entityToResponse(findById(id));
    }  

    @Override
    public Page<P> getAll(Pageable pageable) {
        return findAll(pageable);
    }

    @Override
    public void delete(ID id) {
        deleteById(id);
    }

    @Override
    public List<P> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::entityToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTree(RequestPagingDto request) {
        if (!entityHasParent()) {
            throw new AppException(ErrorCode.ENTITY_NOT_A_TREE);
        }
        
        // Check if search filter is present
        boolean hasFilter = request != null && request.getFilter() != null && !request.getFilter().trim().isEmpty();
        
        // If has filter, use search logic (matched nodes + all ancestors)
        if (hasFilter) {
            return performSearchTree(request);
        }
        
        // No filter - return all or roots based on dataset size
        long total = viewRepository.count();
        
        // If dataset is small (<= 1000), return all as flat list
        if (total <= 1000) {
            List<Map<String, Object>> flat = new ArrayList<>();

            // Prefer reading from the view repository, but if the DB view/schema
            // doesn't contain all mapped columns (causing SQL errors), fall back
            // to reading entities and mapping them to response DTOs. This avoids
            // adding or changing fields on the view/entity classes.
            try {
                List<V> allViews = viewRepository.findAll();
                for (V viewObj : allViews) {
                    flat.add(toMapFromView(viewObj));
                }
                return flat;
            } catch (Exception ex) {
                // Could be SQLSyntaxErrorException wrapped by Spring or other DB-related error
                log.warn("viewRepository.findAll() failed (falling back to entity mapping): {}", ex.getMessage());
                // Fallback: read entities and map to response DTOs, then to maps
                List<E> ents = repository.findAll();
                for (E ent : ents) {
                    P resp = mapper.entityToResponse(ent);
                    Map<String, Object> m = toMapWithChildren(resp);
                    // ensure hasChildren is present and correct
                    Object idVal = m.get("id");
                    if (idVal != null) {
                        m.put("hasChildren", checkHasChildren(idVal));
                    } else {
                        m.put("hasChildren", false);
                    }
                    flat.add(m);
                }
                return flat;
            }
        }
        
        // Large dataset (>1000): return only root nodes as flat list with hasChildren flag
        List<Map<String, Object>> roots = new ArrayList<>();
        
        // Try TreeViewRepository interface first
        if (viewRepository instanceof com.example.quiz.base.baseInterface.TreeViewRepository) {
            try {
                @SuppressWarnings("unchecked")
                com.example.quiz.base.baseInterface.TreeViewRepository<V, ID> treeRepo = 
                    (com.example.quiz.base.baseInterface.TreeViewRepository<V, ID>) viewRepository;
                
                List<V> rootViews = treeRepo.findAllByParentIdIsNull();
                for (V viewObj : rootViews) {
                    roots.add(toMapFromView(viewObj));
                }
                return roots;
            } catch (Exception ex) {
                log.warn("TreeViewRepository.findAllByParentIdIsNull failed: {}", ex.getMessage());
                // Fall through to reflection
            }
        }
        
        // Fallback: reflection-based approach
        try {
            Method m = viewRepository.getClass().getMethod("findAllByParentIdIsNull");
            Object res = m.invoke(viewRepository);
            if (res instanceof java.util.Collection) {
                @SuppressWarnings("unchecked")
                java.util.Collection<V> coll = (java.util.Collection<V>) res;
                for (V viewObj : coll) {
                    roots.add(toMapFromView(viewObj));
                }
                return roots;
            }
        } catch (NoSuchMethodException ignored) {
            log.debug("viewRepository.findAllByParentIdIsNull() not available, using fallback");
        } catch (Exception ex) {
            log.warn("Failed to call viewRepository.findAllByParentIdIsNull(): {}", ex.getMessage());
        }

        // Last resort fallback: scan and filter roots
        java.util.List<E> rootEntities = findEntityRootsUsingRepositoryOrScan();
        for (E ent : rootEntities) {
            Optional<ID> maybeId = extractIdFromEntity(ent);
            if (maybeId.isPresent()) {
                ID id = maybeId.get();
                Optional<V> maybeView = viewRepository.findById(id);
                if (maybeView.isPresent()) {
                    roots.add(toMapFromView(maybeView.get()));
                }
            }
        }
        return roots;
    }
    
    /**
     * Perform search tree - find matched nodes + all their ancestors
     * Extracted from original searchTree() method
     */
    private List<Map<String, Object>> performSearchTree(RequestPagingDto request) {
        // Get table name from view class
        String tableName = getTableNameFromView();
        
        // Build WHERE clause from filter using AdvancedFilterService
        Map<String, Object> parameters = new LinkedHashMap<>();
        String whereClause = buildWhereClauseFromRequest(request, parameters);
        
        if (whereClause == null || whereClause.trim().isEmpty()) {
            // No valid criteria after parsing, return empty to avoid confusion
            return new ArrayList<>();
        }

        try {
            // Use recursive CTE to find matched nodes and all their ancestors
            String sql = buildRecursiveAncestorQuery(tableName, whereClause);
            
            log.info("Search tree SQL: {}", sql);
            log.info("Search tree parameters: {}", parameters);
            
            jakarta.persistence.Query query = entityManager.createNativeQuery(sql);
            
            // Set parameters
            parameters.forEach(query::setParameter);
            
            @SuppressWarnings("unchecked")
            List<Object[]> resultList = query.getResultList();
            
            // Convert to Map format
            return convertResultToTreeMaps(resultList);
            
        } catch (Exception ex) {
            log.error("Failed to execute search tree query: {}", ex.getMessage(), ex);
            // Fallback: iterative ancestor search
            return searchTreeIterative(request);
        }
    }

    @Override
    public List<Map<String, Object>> getChildren(Object parentId) {
        if (!entityHasParent()) {
            return null;
        }
        
        List<Map<String, Object>> children = new ArrayList<>();
        
        // Check if viewRepository implements TreeViewRepository interface
        if (viewRepository instanceof com.example.quiz.base.baseInterface.TreeViewRepository) {
            try {
                @SuppressWarnings("unchecked")
                com.example.quiz.base.baseInterface.TreeViewRepository<V, ID> treeRepo = 
                    (com.example.quiz.base.baseInterface.TreeViewRepository<V, ID>) viewRepository;
                
                List<V> views = treeRepo.findAllByParentId(parentId);
                for (V viewObj : views) {
                    children.add(toMapFromView(viewObj));
                }
                return children;
            } catch (Exception ex) {
                log.warn("TreeViewRepository method failed: {}", ex.getMessage());
                // Fall through to reflection-based approach
            }
        }
        
        // Fallback: Try viewRepository.findAllByParentId(parentId) via reflection
        try {
            Method m = viewRepository.getClass().getMethod("findAllByParentId", Object.class);
            Object res = m.invoke(viewRepository, parentId);
            if (res instanceof java.util.Collection) {
                @SuppressWarnings("unchecked")
                java.util.Collection<V> coll = (java.util.Collection<V>) res;
                for (V viewObj : coll) {
                    children.add(toMapFromView(viewObj));
                }
                return children;
            }
        } catch (NoSuchMethodException ignored) {
            log.debug("viewRepository.findAllByParentId not available");
        } catch (Exception ex) {
            log.warn("Failed to call viewRepository.findAllByParentId(...): {}", ex.getMessage());
        }

        // Last resort fallback: entity-based children query
        java.util.List<E> ents = findEntityChildrenUsingRepositoryOrScan(parentId);
        for (E ent : ents) {
            Optional<ID> maybeId = extractIdFromEntity(ent);
            if (maybeId.isPresent()) {
                ID id = maybeId.get();
                Optional<V> maybeView = viewRepository.findById(id);
                if (maybeView.isPresent()) {
                    children.add(toMapFromView(maybeView.get()));
                    continue;
                }
            }
            P resp = mapper.entityToResponse(ent);
            children.add(toMapWithChildren(resp));
        }
        return children;
    }

    /**
     * Build recursive CTE query to get matched nodes + all ancestors
     */
    private String buildRecursiveAncestorQuery(String tableName, String whereClause) {
        String entityTableName = tableName.replace("_view", "");

        // Build explicit column list matching the order of fields declared in the view class.
        // Use @Column(name=...) if present; otherwise fallback to snake_case conversion.
        Class<V> viewClass = getViewClass();
        java.lang.reflect.Field[] fields = viewClass.getDeclaredFields();
        List<String> cols = new ArrayList<>();
        for (java.lang.reflect.Field f : fields) {
            jakarta.persistence.Column colAnn = f.getAnnotation(jakarta.persistence.Column.class);
            String colName;
            if (colAnn != null && colAnn.name() != null && !colAnn.name().isEmpty()) {
                colName = colAnn.name();
            } else {
                colName = convertToSnakeCase(f.getName());
            }
            cols.add("v." + colName);
        }

        String selectCols = String.join(", ", cols);

        return "WITH RECURSIVE ancestors AS ( " +
                "  SELECT id, parent_id FROM " + entityTableName + " WHERE " + whereClause +
                "  UNION ALL " +
                "  SELECT p.id, p.parent_id FROM " + entityTableName + " p " +
                "  JOIN ancestors a ON p.id = a.parent_id " +
                ") " +
                "SELECT " + selectCols + ", " +
                "  (SELECT COUNT(*) FROM " + entityTableName + " c WHERE c.parent_id = v.id) > 0 AS has_children " +
                "FROM " + tableName + " v " +
                "JOIN (SELECT DISTINCT id FROM ancestors) a ON v.id = a.id";
    }
    
    /**
     * Get table name from view class annotation or naming convention
     */
    private String getTableNameFromView() {
        Class<V> viewClass = getViewClass();
        
        // Try @Subselect annotation
        org.hibernate.annotations.Subselect subselect = viewClass.getAnnotation(org.hibernate.annotations.Subselect.class);
        if (subselect != null) {
            String query = subselect.value();
            if (query.toLowerCase().contains("from ")) {
                String[] parts = query.toLowerCase().split("from ");
                if (parts.length > 1) {
                    String tablePart = parts[1].trim();
                    String viewName = tablePart.split("\\s+")[0];
                    return viewName;
                }
            }
        }
        
        // Fallback: convert class name to snake_case
        String className = viewClass.getSimpleName();
        if (className.endsWith("View")) {
            className = className.substring(0, className.length() - 4);
        }
        return convertToSnakeCase(className) + "_view";
    }
    
    /**
     * Convert camelCase to snake_case
     */
    private String convertToSnakeCase(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
    
    /**
     * Build WHERE clause from RequestPagingDto filter using AdvancedFilterService
     */
    private String buildWhereClauseFromRequest(RequestPagingDto request, Map<String, Object> parameters) {
        String filterJson = request.getFilter();
        if (filterJson == null || filterJson.trim().isEmpty()) {
            return "";
        }
        
        try {
            // Parse filter JSON
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<com.example.quiz.model.dto.request.FilterItemDto> filters = objectMapper.readValue(
                    filterJson, 
                    new com.fasterxml.jackson.core.type.TypeReference<List<com.example.quiz.model.dto.request.FilterItemDto>>() {}
            );
            
            // Build WHERE clause - delegate to AdvancedFilterService logic
            return buildWhereClauseFromFilters(filters, parameters);
            
        } catch (Exception ex) {
            log.error("Failed to parse filter JSON: {}", ex.getMessage());
            return "";
        }
    }
    
    /**
     * Build WHERE clause from filter list (simplified version)
     */
    private String buildWhereClauseFromFilters(List<com.example.quiz.model.dto.request.FilterItemDto> filters, Map<String, Object> parameters) {
        List<String> conditions = new ArrayList<>();
        
        for (com.example.quiz.model.dto.request.FilterItemDto filter : filters) {
            String condition = buildSingleFilterCondition(filter, parameters);
            if (condition != null && !condition.isEmpty()) {
                conditions.add(condition);
            }
        }
        
        return String.join(" AND ", conditions);
    }
    
    /**
     * Build single filter condition
     */
    private String buildSingleFilterCondition(com.example.quiz.model.dto.request.FilterItemDto filter, Map<String, Object> parameters) {
        // Handle OR conditions
        if ((filter.getField() == null || filter.getOperator() == null) && 
            filter.getOrs() != null && !filter.getOrs().isEmpty()) {
            List<String> orConditions = new ArrayList<>();
            for (com.example.quiz.model.dto.request.FilterItemDto orFilter : filter.getOrs()) {
                String orCond = buildSingleFilterCondition(orFilter, parameters);
                if (orCond != null && !orCond.isEmpty()) {
                    orConditions.add(orCond);
                }
            }
            if (!orConditions.isEmpty()) {
                return "(" + String.join(" OR ", orConditions) + ")";
            }
            return "";
        }
        
        if (filter.getField() == null || filter.getOperator() == null) {
            return "";
        }
        
        String paramName = "param" + parameters.size();
        String fieldName = convertToSnakeCase(filter.getField());
        
        switch (filter.getOperator()) {
            case CONTAINS:
                parameters.put(paramName, "%" + filter.getValue() + "%");
                return fieldName + " LIKE :" + paramName;
            case EQUALS:
                parameters.put(paramName, filter.getValue());
                return fieldName + " = :" + paramName;
            case IN:
                if (filter.getValue() instanceof List) {
                    parameters.put(paramName, filter.getValue());
                    return fieldName + " IN (:" + paramName + ")";
                }
                break;
            default:
                // Add more operators as needed
                break;
        }
        
        return "";
    }
    
    /**
     * Fallback: iterative ancestor search (for DBs without recursive CTE support)
     */
    private List<Map<String, Object>> searchTreeIterative(RequestPagingDto request) {
        // Get all views and filter in memory
        List<V> allViews = viewRepository.findAll();
        Set<Object> matchedIds = new java.util.HashSet<>();
        Set<Object> allIds = new java.util.HashSet<>();
        Map<Object, V> viewById = new LinkedHashMap<>();
        
        // Build index
        for (V view : allViews) {
            Map<String, Object> map = toMapFromView(view);
            Object id = map.get("id");
            if (id != null) {
                viewById.put(id, view);
                allIds.add(id);
                
                // Simple filter matching (can be enhanced)
                if (matchesFilter(map, request)) {
                    matchedIds.add(id);
                }
            }
        }
        
        // Collect all ancestors of matched nodes
        Set<Object> result = new java.util.HashSet<>(matchedIds);
        for (Object matchedId : matchedIds) {
            collectAncestors(matchedId, viewById, result);
        }
        
        // Convert to list of maps
        List<Map<String, Object>> flatList = new ArrayList<>();
        for (Object id : result) {
            V view = viewById.get(id);
            if (view != null) {
                flatList.add(toMapFromView(view));
            }
        }
        
        return flatList;
    }
    
    /**
     * Recursively collect all ancestors of a node
     */
    private void collectAncestors(Object nodeId, Map<Object, V> viewById, Set<Object> result) {
        V view = viewById.get(nodeId);
        if (view == null) return;
        
        Map<String, Object> map = toMapFromView(view);
        Object parentId = map.get("parentId");
        
        if (parentId != null && !result.contains(parentId)) {
            result.add(parentId);
            collectAncestors(parentId, viewById, result);
        }
    }
    
    /**
     * Simple filter matching (basic implementation)
     */
    private boolean matchesFilter(Map<String, Object> map, RequestPagingDto request) {
        // TODO: Implement proper filter matching logic
        // For now, just return true to include all for fallback
        return true;
    }
    
    /**
     * Convert native query result to tree maps
     */
    private List<Map<String, Object>> convertResultToTreeMaps(List<Object[]> resultList) {
        List<Map<String, Object>> maps = new ArrayList<>();
        
        // Get column names from view class
        String[] columnNames = Arrays.stream(getViewClass().getDeclaredFields())
                .map(java.lang.reflect.Field::getName)
                .toArray(String[]::new);
        
        for (Object[] row : resultList) {
            Map<String, Object> map = new LinkedHashMap<>();
            for (int i = 0; i < columnNames.length && i < row.length; i++) {
                map.put(columnNames[i], row[i]);
            }
            
            // Add hasChildren from last column
            if (row.length > columnNames.length) {
                Object hasChildrenVal = row[row.length - 1];
                boolean hasChildren = hasChildrenVal instanceof Number && ((Number) hasChildrenVal).intValue() > 0;
                map.put("hasChildren", hasChildren);
            } else {
                map.put("hasChildren", false);
            }
            
            map.put("children", new ArrayList<Map<String, Object>>());
            maps.add(map);
        }
        
        return maps;
    }

    /**    /**
     * Try to call repository.findAllByParentIdIsNull() reflectively. If not available, scan all
     * entities and return those whose parent is null.
     */
    @SuppressWarnings("unchecked")
    private java.util.List<E> findEntityRootsUsingRepositoryOrScan() {
        try {
            Method m = repository.getClass().getMethod("findAllByParentIdIsNull");
            Object res = m.invoke(repository);
            if (res instanceof java.util.Collection) {
                return new ArrayList<>((java.util.Collection<E>) res);
            }
        } catch (NoSuchMethodException ignored) {
            // fall through to scan
        } catch (Exception ex) {
            log.warn("Failed to call repository.findAllByParentIdIsNull(): {}", ex.getMessage());
        }

        // Scan all and filter where parent is null
        java.util.List<E> all = repository.findAll();
        java.util.List<E> roots = new ArrayList<>();
        for (E ent : all) {
            Optional<Object> parent = extractParentIdFromEntity(ent);
            if (parent.isEmpty() || parent.get() == null) {
                roots.add(ent);
            }
        }
        return roots;
    }

    /**
     * Try to call repository.findAllByParentId(parentId) reflectively. If not available, scan all
     * entities and return those whose parent equals parentId.
     */
    @SuppressWarnings("unchecked")
    private java.util.List<E> findEntityChildrenUsingRepositoryOrScan(Object parentId) {
        try {
            Method m = repository.getClass().getMethod("findAllByParentId", Object.class);
            Object res = m.invoke(repository, parentId);
            if (res instanceof java.util.Collection) {
                return new ArrayList<>((java.util.Collection<E>) res);
            }
        } catch (NoSuchMethodException ignored) {
            // fall through to scan
        } catch (Exception ex) {
            log.warn("Failed to call repository.findAllByParentId(...): {}", ex.getMessage());
        }

        java.util.List<E> all = repository.findAll();
        java.util.List<E> children = new ArrayList<>();
        for (E ent : all) {
            Optional<Object> p = extractParentIdFromEntity(ent);
            if (p.isPresent() && p.get() != null) {
                Object pid = p.get();
                if (pid.equals(parentId) || pid.toString().equals(String.valueOf(parentId))) {
                    children.add(ent);
                }
            }
        }
        return children;
    }

    /**
     * Extract parent id value from an entity by checking getParentId/getParent, or fields named parentId/parent.
     */
    @SuppressWarnings("unchecked")
    private Optional<Object> extractParentIdFromEntity(E ent) {
        try {
            Method m = ent.getClass().getMethod("getParentId");
            Object val = m.invoke(ent);
            return Optional.ofNullable(val);
        } catch (NoSuchMethodException ignored) {
            // try getParent()
        } catch (Exception ex) {
            log.debug("getParentId failed: {}", ex.getMessage());
        }

        try {
            Method m2 = ent.getClass().getMethod("getParent");
            Object parentObj = m2.invoke(ent);
            if (parentObj == null) return Optional.empty();
            Optional<ID> pid = extractIdFromEntity((E) parentObj);
            return pid.map(id -> (Object) id);
        } catch (NoSuchMethodException ignored) {
            // try fields
        } catch (Exception ex) {
            log.debug("getParent failed: {}", ex.getMessage());
        }

        try {
            for (Field f : ent.getClass().getDeclaredFields()) {
                if (f.getName().equals("parentId")) {
                    f.setAccessible(true);
                    Object val = f.get(ent);
                    return Optional.ofNullable(val);
                }
                if (f.getName().equals("parent")) {
                    f.setAccessible(true);
                    Object parentObj = f.get(ent);
                    if (parentObj == null) return Optional.empty();
                    // try to extract id from parent object
                    Optional<ID> pid = extractIdFromEntity((E) parentObj);
                    return pid.map(id -> (Object) id);
                }
            }
        } catch (Exception ex) {
            log.debug("field parent extraction failed: {}", ex.getMessage());
        }

        return Optional.empty();
    }

    /**
     * Heuristic: inspect the mapper's entityToResponse return type (response DTO P) to detect
     * if there is a parent or parentId property. We prefer checking the response DTO because
     * the tree API returns maps built from response objects.
     */
    private boolean entityHasParent() {
        try {
            Method[] methods = mapper.getClass().getMethods();
            for (Method m : methods) {
                if ("entityToResponse".equals(m.getName()) && m.getParameterCount() == 1) {
                    Class<?> respClass = m.getReturnType();
                    // check for getters
                    for (Method gm : respClass.getMethods()) {
                        String name = gm.getName();
                        if ((name.equals("getParentId") || name.equals("getParent")) && gm.getParameterCount() == 0) {
                            return true;
                        }
                    }
                    // check fields
                    for (Field f : respClass.getDeclaredFields()) {
                        String fname = f.getName();
                        if (fname.equals("parentId") || fname.equals("parent")) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("entityHasParent check failed: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Convert a view object (V) into a Map of its getter properties and add an empty children list.
     */
    private Map<String, Object> toMapFromView(V viewObj) {
        Map<String, Object> map = new LinkedHashMap<>();
        final Object[] nodeIdHolder = {null}; // Use array to make it effectively final
        
        Arrays.stream(viewObj.getClass().getDeclaredMethods())
                .filter(m -> m.getParameterCount() == 0 && m.getName().startsWith("get"))
                .forEach(m -> {
                    try {
                        String prop = m.getName().substring(3);
                        prop = Character.toLowerCase(prop.charAt(0)) + prop.substring(1);
                        Object val = m.invoke(viewObj);
                        map.put(prop, val);
                        if ("id".equals(prop)) {
                            nodeIdHolder[0] = val;
                        }
                    } catch (Exception ignored) {
                        log.warn("Failed to invoke view getter: {}", ignored.getMessage());
                    }
                });
        
        // Add hasChildren flag
        boolean hasChildren = false;
        if (nodeIdHolder[0] != null) {
            hasChildren = checkHasChildren(nodeIdHolder[0]);
        }
        
        map.put("children", new ArrayList<Map<String, Object>>());
        map.put("hasChildren", hasChildren);
        return map;
    }
    
    /**
     * Check if a node has children by counting via repository
     */
    private boolean checkHasChildren(Object nodeId) {
        // Try TreeViewRepository interface first
        if (viewRepository instanceof com.example.quiz.base.baseInterface.TreeViewRepository) {
            try {
                @SuppressWarnings("unchecked")
                com.example.quiz.base.baseInterface.TreeViewRepository<V, ID> treeRepo = 
                    (com.example.quiz.base.baseInterface.TreeViewRepository<V, ID>) viewRepository;
                
                long count = treeRepo.countByParentId(nodeId);
                return count > 0;
            } catch (Exception ex) {
                log.debug("TreeViewRepository.countByParentId failed for node {}: {}", nodeId, ex.getMessage());
                // Fall through to reflection
            }
        }
        
        // Fallback: reflection-based approach
        try {
            Method countMethod = viewRepository.getClass().getMethod("countByParentId", Object.class);
            Object count = countMethod.invoke(viewRepository, nodeId);
            return count instanceof Number && ((Number) count).longValue() > 0;
        } catch (NoSuchMethodException ignored) {
            // Method not available, assume might have children for safety
            return true;
        } catch (Exception ex) {
            log.debug("Failed to check hasChildren for node {}: {}", nodeId, ex.getMessage());
            return true; // Safe default
        }
    }

    /**
     * Try to extract the ID value from the entity via a getId() method or by reading a field annotated with @Id.
     */
    @SuppressWarnings("unchecked")
    private Optional<ID> extractIdFromEntity(E ent) {
        try {
            Method getId = ent.getClass().getMethod("getId");
            Object idVal = getId.invoke(ent);
            return Optional.of((ID) idVal);
        } catch (NoSuchMethodException | SecurityException ignored) {
            log.warn("Entity has no getId() method, will try @Id field");
        } catch (Exception ex) {
            log.warn("Failed to invoke getId(): {}", ex.getMessage());
        }

        try {
            for (Field f : ent.getClass().getDeclaredFields()) {
                if (f.isAnnotationPresent(Id.class)) {
                    f.setAccessible(true);
                    Object idVal = f.get(ent);
                    return Optional.of((ID) idVal);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to extract @Id field: {}", ex.getMessage());
        }

        return Optional.empty();
    }

    private Map<String, Object> toMapWithChildren(P resp) {
        Map<String, Object> map = new LinkedHashMap<>();
        Arrays.stream(resp.getClass().getDeclaredMethods())
                .filter(m -> m.getParameterCount() == 0 && m.getName().startsWith("get"))
                .forEach(m -> {
                    try {
                        String prop = m.getName().substring(3);
                        prop = Character.toLowerCase(prop.charAt(0)) + prop.substring(1);
                        Object val = m.invoke(resp);
                        map.put(prop, val);
                    } catch (Exception ignored) {
                        log.warn("Failed to invoke getter: " + ignored.getMessage());
                        throw new RuntimeException(ignored);
                    }
                });
        map.put("children", new ArrayList<Map<String, Object>>());
        return map;
    }

    @Override
    public Optional<E> findEntityById(ID id) {
        return repository.findById(id);
    }

    // Helper method to check if entity exists
    public boolean exists(ID id) {
        return repository.existsById(id);
    }

    /* -------------------- Lifecycle hooks (override in subclasses) -------------------- */
    /** Called before creating an entity. Can be overridden to validate/modify request. */
    @Override
    public void beforeCreate(R request) {
        // no-op by default
    }

    /** Called after an entity has been created. Receives the persisted entity and response DTO. */
    @Override
    public void afterCreate(E entity, P response) {
        // no-op by default
    }

    /** Called before updating an entity. Receives id, request and the existing entity instance. */
    @Override
    public void beforeUpdate(ID id, R request, E existingEntity) {
        // no-op by default
    }

    /** Called after updating an entity. Receives the persisted entity and response DTO. */
    @Override
    public void afterUpdate(E entity, P response) {
        // no-op by default
    }

    /** Called before deleting an entity. Receives id and existing entity. */
    @Override
    public void beforeDelete(ID id, E existingEntity) {
        // no-op by default
    }

    /** Called after deleting an entity. Receives id and the deleted entity snapshot. */
    @Override
    public void afterDelete(ID id, E deletedEntitySnapshot) {
        // no-op by default
    }

    // Default validation methods - override in specific implementations
    @Override
    public boolean validate(ID id) {
        return exists(id);
    }

    @Override
    public void validateBeforeCreate(R request) {
        // Override in specific implementations for business rules
    }

    @Override
    public void validateBeforeUpdate(ID id, R request) {
        if (!exists(id)) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }
        // Override in specific implementations for business rules
    }

    @Override
    public void validateBeforeDelete(ID id) {
        if (!exists(id)) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }
        // Override in specific implementations for business rules
    }
}