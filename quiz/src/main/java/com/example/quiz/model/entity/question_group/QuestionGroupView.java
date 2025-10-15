package com.example.quiz.model.entity.question_group;

import com.example.quiz.base.BaseView;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Entity
@Immutable
@Subselect("""
    select * from question_groups_view
    """)
@Getter
@Setter
public class QuestionGroupView extends BaseView {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "content_html", columnDefinition = "TEXT", nullable = false)
    private String contentHtml;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
}
