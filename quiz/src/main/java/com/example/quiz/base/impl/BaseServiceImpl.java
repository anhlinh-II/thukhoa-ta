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
        E entity = mapper.requestToEntity(request);
        E savedEntity = repository.save(entity);
        return mapper.entityToResponse(savedEntity);
    }

    @Override
    public P update(ID id, R request) {
        validateBeforeUpdate(id, request);
        E existingEntity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Entity not found with id: " + id));

        mapper.updateEntityFromRequest(request, existingEntity);
        E savedEntity = repository.save(existingEntity);
        return mapper.entityToResponse(savedEntity);
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
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Entity not found with id: " + id);
        }
        repository.deleteById(id);
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

        // Fallback: query entity roots and try to fetch corresponding view rows by id
        java.util.List<E> rootEntities = repository.findAllByParentIdIsNull();
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

        // Fallback: query entity children and map to views or response DTOs
        java.util.List<E> ents = repository.findAllByParentId(parentId);
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
    protected boolean exists(ID id) {
        return repository.existsById(id);
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