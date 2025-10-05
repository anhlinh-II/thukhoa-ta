package com.example.quiz.util;

/** Marker interface for entities that can generate a slug automatically. */
public interface Sluggable {
    /** Return the source string used to generate the slug (e.g. name). */
    String getSlugSource();

    /** Set the generated slug on the entity. */
    void setSlug(String slug);

    /** Optional: get current slug value */
    String getSlug();
}
