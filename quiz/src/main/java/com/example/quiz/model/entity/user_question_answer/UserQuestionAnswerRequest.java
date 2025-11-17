package com.example.quiz.model.entity.user_question_answer;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class UserQuestionAnswerRequest {
    Long id;

    Long userId;

    Long questionId;

    Long quizHisId;

    Long questionOptionId;

    int timeSpent;

    Boolean isCorrect;
}
