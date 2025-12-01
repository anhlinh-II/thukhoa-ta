package com.example.quiz.model.entity.course;

import java.time.Instant;

import com.example.quiz.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "course_entitlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CourseEntitlement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private CourseEnrollment enrollment;

    @Column(length = 100, nullable = false)
    private String feature;

    private Boolean allowed = true;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(columnDefinition = "JSON")
    private String metadata;
}
