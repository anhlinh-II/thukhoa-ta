package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagingResponseDto<T> {
    private boolean empty;
    private List<T> data;
    private long total;
    private Map<String, Object> summary;

    public static <T> PagingResponseDto<T> of(boolean empty, List<T> data, long total, Map<String, Object> summary) {
        return new PagingResponseDto<>(empty, data, total, summary);
    }
}
