package com.example.quiz.base.baseInterface;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 *
 * @param <E> Entity
 * @param <R> Request dto
 * @param <P> Response dto
 */
public interface BaseMapstruct<E, R, P, V> {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    E requestToEntity(R request);

    P entityToResponse(E entity);
    P viewToResponse(V view);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(R request, @MappingTarget E entity);

    default List<E> requestsToEntities(Collection<R> requests) {
        return requests.stream().map(this::requestToEntity).collect(Collectors.toList());
    }

    default List<P> entitiesToResponses(Collection<E> entities) {
        return entities.stream().map(this::entityToResponse).collect(Collectors.toList());
    }

    default List<P> viewsToResponses(Collection<V> views) {
        return views.stream().map(this::viewToResponse).collect(Collectors.toList());
    }
}


