package com.example.quiz.model.entity.user_vocabulary;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.time.LocalDateTime;

import com.example.quiz.base.BaseEntity;

@Entity
@Table(name = "user_vocabulary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserVocabulary extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "word", nullable = false)
    private String word;

    @Column(name = "language", nullable = false)
    private String language;

    @Column(name = "definitions", columnDefinition = "JSON")
    private String definitions; // stored as JSON string

    @Column(name = "examples", columnDefinition = "JSON")
    private String examples;

    @Column(name = "phonetics", columnDefinition = "JSON")
    private String phonetics;

    @Column(name = "part_of_speech")
    private String partOfSpeech;

    @Column(name = "ease")
    private Double ease;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "repetitions")
    private Integer repetitions;

    @Column(name = "next_review_at")
    private Instant nextReviewAt;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @Column(name = "lapses")
    private Integer lapses;

    @Column(name = "consecutive_fails")
    private Integer consecutiveFails;

    @Column(name = "priority")
    private Double priority;

    @Column(name = "raw_entry", columnDefinition = "JSON")
    private String rawEntry;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
