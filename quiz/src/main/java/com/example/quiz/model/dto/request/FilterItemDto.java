package com.example.quiz.model.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class FilterItemDto {
    private String field;
    private FilterOperator operator;
    private Object value;
    private List<FilterItemDto> ors;
    private DataType dataType;

    public enum FilterOperator {
        EQUALS("="),
        NOT_EQUALS("!="),
        GREATER_THAN(">"),
        GREATER_THAN_OR_EQUAL(">="),
        LESS_THAN("<"),
        LESS_THAN_OR_EQUAL("<="),
        CONTAINS("CONTAINS"),
        NOT_CONTAINS("NCONTAINS"),
        STARTS_WITH("STARTSWITH"),
        ENDS_WITH("ENDSWITH"),
        BETWEEN("BETWEEN"),
        NOT_BETWEEN("NOT BETWEEN"),
        IN("IN"),
        NOT_IN("NOT IN"),
        EMPTY("EMPTY"),
        NOT_EMPTY("NEMPTY"),
        IS_NULL("IS NULL"),
        IS_NOT_NULL("IS NOT NULL");

        private final String value;

        FilterOperator(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum DataType {
        STRING, DATETIME, NUMBER, BOOL
    }
}
