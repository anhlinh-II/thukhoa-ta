package com.example.quiz.util;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * JPA entity listener to generate slug for entities implementing Sluggable.
 */
public class SlugEntityListener {

    @PrePersist
    @PreUpdate
    public void setSlugIfEmpty(Object entity) {
        if (entity instanceof Sluggable) {
            Sluggable s = (Sluggable) entity;
            String current = s.getSlug();
            String source = s.getSlugSource();
            if ((current == null || current.isBlank()) && source != null && !source.isBlank()) {
                s.setSlug(SlugUtils.generateSlug(source));
            }
        }
    }
}
