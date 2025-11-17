package com.example.quiz.base.impl;

import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BaseResponse {
    private Instant createdAt;
    private Instant updatedAt;
    private String updatedBy;
    private String createdBy;
    private Long id;
}
