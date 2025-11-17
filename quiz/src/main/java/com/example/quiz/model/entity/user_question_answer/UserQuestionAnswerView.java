package com.example.quiz.model.entity.user_question_answer;

import com.example.quiz.base.BaseView;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

@Immutable
@Entity
@Subselect("""
    select * from users_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserQuestionAnswerView extends BaseView {
    @Id
    private Long id;

    private Long userId;

    private Long questionId;

    private Long quizHisId;

    private Long questionOptionId;

    private int timeSpent;

    private Boolean isCorrect;
}
