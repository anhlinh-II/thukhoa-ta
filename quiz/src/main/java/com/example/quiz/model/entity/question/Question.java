package com.example.quiz.model.entity.question;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.enums.QuestionType;
import com.example.quiz.enums.QuizType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "questions")
public class Question extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @Column(name = "quiz_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private QuizType quizType;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "group_id", nullable = false) // tham chiếu đến question group
    private Long groupId;

    @Column(name = "content_html", columnDefinition = "TEXT", nullable = false)
    private String contentHtml;

    @Column(name = "score")
    private Double score;

    @Column(name = "order_index")
    private int orderIndex;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;

    @Column(name = "explanation_html", columnDefinition = "TEXT")
    private String explanationHtml;
}
