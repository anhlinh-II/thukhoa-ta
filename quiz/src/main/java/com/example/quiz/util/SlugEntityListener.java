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
                String current = s.getSlug();
                String source = s.getSlugSource();
                if ((current == null || current.isBlank()) && source != null && !source.isBlank()) {
                    String generated = SlugUtils.generateSlug(source);
                    s.setSlug(generated);
                    log.debug("Generated slug='{}' for entity {}", generated, entity.getClass().getSimpleName());
                } else {
                    log.debug("Slug unchanged for entity {} - current='{}'", entity.getClass().getSimpleName(), current);
                }
            }
        } catch (Exception ex) {
            // Don't fail the persistence because slug generation failed; log instead
            log.warn("SlugEntityListener failed for {}: {}", entity == null ? "null" : entity.getClass().getSimpleName(), ex.getMessage());
        }
    }
}
