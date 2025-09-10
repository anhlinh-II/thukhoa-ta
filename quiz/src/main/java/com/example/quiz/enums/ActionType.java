package com.example.quiz.enums;

public enum ActionType {
    CREATE("CREATE"),
    READ("READ"),
    UPDATE("UPDATE"),
    DELETE("DELETE"),
    MANAGE("MANAGE"),
    VIEW_ALL("VIEW_ALL"),
    EXPORT("EXPORT"),
    IMPORT("IMPORT");

    private final String value;

    ActionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
