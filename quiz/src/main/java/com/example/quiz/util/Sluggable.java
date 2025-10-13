package com.example.quiz.util;

/** Marker interface for entities that can generate a slug automatically. */
public interface Sluggable {
    /** Return the source string used to generate the slug (e.g. name). */
    String getSlugSource();

    /** Set the generated slug on the entity. */
    void setSlug(String slug);

    /** Optional: get current slug value */
    String getSlug();

    /**
     * Compute the slug that would be generated from the current slug source.
     * This delegates to SlugUtils and is intended as a convenience for services
     * and listeners to compare new vs existing slug values without duplicating
     * generation logic.
     *
     * @return computed slug or null if source is null/blank
     */
    default String computeSlugFromSource() {
        String src = getSlugSource();
        if (src == null || src.isBlank()) return null;
        return SlugUtils.generateSlug(src);
    }

    /**
     * Convenience helper to check whether the current stored slug differs from
     * the slug that would be generated from the current source value.
     *
     * @return true if current slug is different from computed slug
     */
    default boolean isSlugDifferentFromComputed() {
        String current = getSlug();
        String computed = computeSlugFromSource();
        return !java.util.Objects.equals(current, computed);
    }
}
