package com.example.quiz.model.entity.user_vocabulary;

import com.example.quiz.base.impl.BaseResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
//@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class UserVocabularyResponse extends BaseResponse {
}
