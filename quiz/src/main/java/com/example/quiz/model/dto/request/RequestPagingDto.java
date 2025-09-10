package com.example.quiz.model.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class RequestPagingDto {
    private int skip;
    private int take;
    private String sort;
    private String columns;
    private String aggs;
    private String filter;

    @JsonProperty("empty_filter")
    private String emptyFilter;

    @JsonProperty("isGetTotal")
    private boolean isGetTotal;

    private Map<String, Object> customParam;
}
