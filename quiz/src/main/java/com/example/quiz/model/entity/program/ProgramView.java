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
    SELECT 
        p.id,
        p.name,
        p.description,
        p.level,
        p.is_active,
        p.display_order,
        p.parent_id,
        p.depth,
        p.path,
        p.created_at,
        p.created_by,
        p.updated_at,
        p.updated_by,
        p.image_url,
        (SELECT COUNT(*) FROM programs child WHERE child.parent_id = p.id AND child.is_deleted = false) AS children_count,
        (SELECT COUNT(*) FROM quiz_group qg WHERE qg.program_id = p.id AND qg.is_deleted = false) AS quiz_group_count,
        CASE 
            WHEN (SELECT COUNT(*) FROM programs child WHERE child.parent_id = p.id AND child.is_deleted = false) = 0 
            THEN true 
            ELSE false 
        END AS is_leaf
    FROM programs p
    WHERE p.is_deleted = false
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

    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "children_count")
    Integer childrenCount;

    @Column(name = "quiz_group_count")
    Integer quizGroupCount;

    @Column(name = "is_leaf")
    Boolean isLeaf;
}
