package com.example.quiz.model.view;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Entity
@Subselect("SELECT * FROM quiz_group_view")
@Immutable
@Getter
@Setter
public class QuizGroupView {

    @Id
    private Long id;

    @Column(name = "program_id")
    private Long programId;

    private String name;

    private String description;

    private String slug;

    @Column(name = "program_name")
    private String programName;

    @Column(name = "program_slug")
    private String programSlug;

    @Column(name = "program_is_active")
    private Boolean programIsActive;

    @Column(name = "program_is_deleted")
    private Boolean programIsDeleted;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type")
    private GroupType groupType;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    public enum GroupType {
        FORMAT, TOPIC, MOCK_TEST, OTHER
    }
}
