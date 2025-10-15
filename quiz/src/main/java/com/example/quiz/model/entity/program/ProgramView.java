package com.example.quiz.model.entity.program;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

import static lombok.AccessLevel.PRIVATE;

@Entity
@Immutable
@Subselect("""
    select * from programs_view
    """)
@Getter
@Setter
@FieldDefaults(level = PRIVATE)
public class ProgramView {

    @Id
    @Column(name = "id")
    Long id;

    @Column(name = "name")
    String name;

    @Column(name = "description")
    String description;

    @Column(name = "level")
    Integer level;

    @Column(name = "is_active")
    Boolean isActive;

    @Column(name = "display_order")
    Integer displayOrder;

    @Column(name = "parent_id")
    Long parentId;

    @Column(name = "depth")
    Integer depth;

    @Column(name = "path")
    String path;

    @Column(name = "created_at")
    Instant createdAt;

    @Column(name = "created_by")
    String createdBy;

    @Column(name = "updated_at")
    Instant updatedAt;

    @Column(name = "updated_by")
    String updatedBy;
}
