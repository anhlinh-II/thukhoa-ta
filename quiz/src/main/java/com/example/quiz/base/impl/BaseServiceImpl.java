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
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import jakarta.persistence.Id;

@RequiredArgsConstructor
@SuperBuilder
@Slf4j
public abstract class BaseServiceImpl<E, ID, R, P, V> implements BaseService<E, ID, R, P, V> {

    private final AdvancedFilterService advancedFilterService;
    private final BaseRepository<E, ID> repository;
    private final BaseMapstruct<E, R, P, V> mapper;
    private final JpaRepository<V, ID> viewRepository;

    @Override
    public P create(R request) {
        validateBeforeCreate(request);
        // lifecycle hook
        beforeCreate(request);
        E entity = mapper.requestToEntity(request);
        E savedEntity = repository.save(entity);
        P response = mapper.entityToResponse(savedEntity);
        // lifecycle hook after persistence
        afterCreate(savedEntity, response);
        return response;
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
    public List<Map<String, Object>> getTree() {
        if (!entityHasParent()) {
            throw new AppException(ErrorCode.ENTITY_NOT_A_TREE);
        }

        // If dataset small, build entire tree in-memory. If large (>1000), return only roots and let FE fetch children lazily.
        long total = repository.count();
        if (total <= 1000) {
            // Use viewRepository to load view objects (V) and map their fields so tree returns all view fields
            List<V> allViews = viewRepository.findAll();
            Map<Object, Map<String, Object>> nodeById = new LinkedHashMap<>();
            List<Map<String, Object>> roots = new ArrayList<>();

            for (V viewObj : allViews) {
                Map<String, Object> map = toMapFromView(viewObj);
                Object id = map.get("id");
                nodeById.put(id, map);
            }

            for (Map<String, Object> node : nodeById.values()) {
                Object parentId = node.get("parentId");
                if (parentId == null) {
                    roots.add(node);
                } else {
                    Map<String, Object> parent = nodeById.get(parentId);
                    if (parent != null) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");
                        children.add(node);
                    } else {
                        roots.add(node);
                    }
                }
            }

            return roots;
        }

        // Large dataset: avoid loading all rows. Query DB for top-level roots (parentId IS NULL)
        List<Map<String, Object>> roots = new ArrayList<>();
        // Try to use viewRepository's derived method findAllByParentIdIsNull() if it's available
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
            // fall back to entity-based root query
        } catch (Exception ex) {
            log.warn("Failed to call viewRepository.findAllByParentIdIsNull(): {}", ex.getMessage());
        }

        // Fallback: try repository method reflectively, otherwise scan all entities and pick roots
        java.util.List<E> rootEntities = findEntityRootsUsingRepositoryOrScan();
        for (E ent : rootEntities) {
            Optional<ID> maybeId = extractIdFromEntity(ent);
            if (maybeId.isPresent()) {
                ID id = maybeId.get();
                Optional<V> maybeView = viewRepository.findById(id);
                if (maybeView.isPresent()) {
                    roots.add(toMapFromView(maybeView.get()));
                    continue;
                }
            }
            // as a last resort, map entity -> response DTO and expose its fields
            P resp = mapper.entityToResponse(ent);
            roots.add(toMapWithChildren(resp));
        }

        return roots;
    }

    @Override
    public List<Map<String, Object>> getChildren(Object parentId) {
        if (!entityHasParent()) {
            return null;
        }
        // Use repository derived query to fetch direct children only
        List<Map<String, Object>> children = new ArrayList<>();
        // Try viewRepository.findAllByParentId(parentId) via reflection
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
            // fall back to entity-based children query
        } catch (Exception ex) {
            log.warn("Failed to call viewRepository.findAllByParentId(...): {}", ex.getMessage());
        }

        // Fallback: try repository method reflectively, otherwise scan all entities and pick matching children
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
        Arrays.stream(viewObj.getClass().getDeclaredMethods())
                .filter(m -> m.getParameterCount() == 0 && m.getName().startsWith("get"))
                .forEach(m -> {
                    try {
                        String prop = m.getName().substring(3);
                        prop = Character.toLowerCase(prop.charAt(0)) + prop.substring(1);
                        Object val = m.invoke(viewObj);
                        map.put(prop, val);
                    } catch (Exception ignored) {
                        log.warn("Failed to invoke view getter: {}", ignored.getMessage());
                    }
                });
        map.put("children", new ArrayList<Map<String, Object>>());
        return map;
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