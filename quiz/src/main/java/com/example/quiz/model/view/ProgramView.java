package com.example.quiz.model.view;

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
        CASE 
            WHEN p.level = 1 THEN 'Beginner'
            WHEN p.level = 2 THEN 'Intermediate' 
            WHEN p.level = 3 THEN 'Advanced'
            ELSE 'Unknown'
        END as level_name,
        p.is_active,
        p.display_order,
        p.parent_id,
        parent.name as parent_name,
        p.depth,
        p.path,
        (SELECT COUNT(*) 
         FROM program child 
         WHERE child.parent_id = p.id AND child.is_active = true) as children_count,
        (SELECT COUNT(*) 
         FROM quiz q 
         WHERE q.program_id = p.id AND q.is_active = true) as quiz_count,
        CASE 
            WHEN (SELECT COUNT(*) FROM program child WHERE child.parent_id = p.id AND child.is_active = true) = 0 
            THEN true 
            ELSE false 
        END as is_leaf,
        p.created_at,
        p.created_by,
        p.updated_at,
        p.updated_by
    FROM 
        program p
        LEFT JOIN program parent ON p.parent_id = parent.id
    WHERE 
        p.is_active = true
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

    @Column(name = "level_name")
    String levelName;

    @Column(name = "is_active")
    Boolean isActive;

    @Column(name = "display_order")
    Integer displayOrder;

    @Column(name = "parent_id")
    Long parentId;

    @Column(name = "parent_name")
    String parentName;

    @Column(name = "depth")
    Integer depth;

    @Column(name = "path")
    String path; // Full path from root to current

    @Column(name = "children_count")
    Integer childrenCount;

    @Column(name = "quiz_count")
    Integer quizCount;

    @Column(name = "is_leaf")
    Boolean isLeaf;

    @Column(name = "created_at")
    Instant createdAt;

    @Column(name = "created_by")
    String createdBy;

    @Column(name = "updated_at")
    Instant updatedAt;

    @Column(name = "updated_by")
    String updatedBy;
}
