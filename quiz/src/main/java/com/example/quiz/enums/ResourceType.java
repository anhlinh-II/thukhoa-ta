package com.example.quiz.enums;

public enum ResourceType {
    USER("USER"),
    QUIZ("QUIZ"),
    QUIZ_CATEGORY("QUIZ_CATEGORY"),
    ROLE("ROLE"),
    PERMISSION("PERMISSION"),
    SYSTEM("SYSTEM");

    private final String value;

    ResourceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
