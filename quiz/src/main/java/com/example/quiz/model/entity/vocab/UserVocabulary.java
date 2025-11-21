package com.example.quiz.model.entity.vocab;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_vocabulary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserVocabulary {
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
    private LocalDateTime nextReviewAt;

    @Column(name = "raw_entry", columnDefinition = "JSON")
    private String rawEntry;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.language == null) this.language = "en";
        if (this.ease == null) this.ease = 2.5;
        if (this.intervalDays == null) this.intervalDays = 0;
        if (this.repetitions == null) this.repetitions = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
