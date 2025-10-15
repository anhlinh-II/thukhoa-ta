package com.example.quiz.model.entity.question_option;

import com.example.quiz.base.BaseView;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Entity
@Immutable
@Subselect("""
    select * from question_options_view
    """)
@Getter
@Setter
public class QuestionOptionView extends BaseView {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "match_key")
    private String matchKey;

    @Column(name = "order_index")
    private int orderIndex;
}
