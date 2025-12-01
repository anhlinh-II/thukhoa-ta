package com.example.quiz.model.entity.course.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequestDto {
    private String name;
    private String slug;
    private String description;
    private Double price;
    private Boolean isPaid;
    private Boolean isPublished;
}
