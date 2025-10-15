package com.example.quiz.model.entity.question;

import com.example.quiz.base.BaseView;
import com.example.quiz.enums.QuestionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.Instant;

import static lombok.AccessLevel.PRIVATE;

@Entity
@Immutable
@Subselect("""
    select * from questions_view
    """)
@Getter
@Setter
public class QuestionView extends BaseView {
    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "type", nullable = false)
    private QuestionType type;

    @Column(name = "group_id", nullable = false)
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
