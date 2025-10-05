package com.example.quiz.util;

public final class SlugUtils {

    private SlugUtils() {}

    /**
     * Generate a slug from an input string. Lowercases, removes invalid chars,
     * collapses whitespace and hyphens, trims leading/trailing hyphens.
     */
    public static String generateSlug(String input) {
        if (input == null) return "";
        String s = input.toLowerCase();
        // remove accents and diacritics (simple normalization)
        s = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // remove invalid chars
        s = s.replaceAll("[^a-z0-9\\s-]", "");
        // collapse whitespace
        s = s.replaceAll("\\s+", "-");
        // collapse multiple hyphens
        s = s.replaceAll("-+", "-");
        // trim leading/trailing hyphens
        s = s.replaceAll("(^-+|-+$)", "");
        return s;
    }
}
