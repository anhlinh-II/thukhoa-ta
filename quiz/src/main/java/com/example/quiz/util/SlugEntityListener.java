package com.example.quiz.util;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JPA entity listener to generate slug for entities implementing Sluggable.
 */
public class SlugEntityListener {

    private static final Logger log = LoggerFactory.getLogger(SlugEntityListener.class);

    @PrePersist
    @PreUpdate
    public void setSlugIfEmpty(Object entity) {
        try {
            if (entity instanceof Sluggable) {
                Sluggable s = (Sluggable) entity;
                s.applyComputedSlugIfEmpty();
                log.debug("Applied computed slug for entity {} - slug='{}'", entity.getClass().getSimpleName(), s.getSlug());
            }
        } catch (Exception ex) {
            // Don't fail the persistence because slug generation failed; log instead
            log.warn("SlugEntityListener failed for {}: {}", entity == null ? "null" : entity.getClass().getSimpleName(), ex.getMessage());
        }
    }
}
