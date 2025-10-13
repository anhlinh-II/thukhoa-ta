package com.example.quiz.util;

import java.util.UUID;
import java.util.function.Predicate;

/**
 * Helper utility for slug generation and uniqueness enforcement.
 *
 * Usage: pass a predicate that returns true when a slug already exists in the DB
 * (for example: s -> repository.existsBySlugAndIsDeletedFalse(s)).
 */
public final class SlugService {

    private SlugService() {}

    /**
     * Ensure the returned slug is unique according to the provided predicate.
     * If baseSlug is already unique (predicate returns false), it is returned.
     * Otherwise a short random suffix is appended (retries until unique).
     *
     * @param existsPredicate predicate that returns true when slug exists
     * @param baseSlug initial slug to try
     * @return a slug that is guaranteed (to the predicate) to be unique
     */
    public static String ensureUniqueSlug(Predicate<String> existsPredicate, String baseSlug) {
        if (baseSlug == null) return null;
        String candidate = baseSlug;
        if (!existsPredicate.test(candidate)) return candidate;

        // Try appending short UUID segments until unique
        for (int i = 0; i < 10; i++) {
            String suffix = UUID.randomUUID().toString().split("-")[0];
            candidate = baseSlug + "-" + suffix;
            if (!existsPredicate.test(candidate)) return candidate;
        }

        // Fallback: append full UUID
        candidate = baseSlug + "-" + UUID.randomUUID().toString();
        return candidate;
    }
}
