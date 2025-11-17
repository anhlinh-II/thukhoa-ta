package com.example.quiz.model.entity.user_question_answer;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.enums.Gender;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_question_answer")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserQuestionAnswer extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long questionId;

    private Long quizHisId;

    private Long questionOptionId;

    private int timeSpent;

    private Boolean isCorrect;
}
