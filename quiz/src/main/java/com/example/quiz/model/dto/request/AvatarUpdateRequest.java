package com.example.quiz.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AvatarUpdateRequest {

    @NotBlank
    private String avatarUrl;
}
