package com.example.quiz.model.entity.course;

import java.time.Instant;

import com.example.quiz.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "course_enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CourseEnrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 50)
    private String status = "ACTIVE";

    @Column(name = "enrolled_at")
    private Instant enrolledAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(columnDefinition = "JSON")
    private String metadata;
}
