package com.example.quiz.model.entity.user_vocabulary;

import com.example.quiz.base.BaseView;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;
import java.time.LocalDateTime;

@Immutable
@Entity
@Subselect("""
    select * from user_vocabulary_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserVocabularyView extends BaseView {
    @Id
    private Long id;

    private Long userId;

    private String word;

    private String language;

    private String definitions; // stored as JSON string

    private String examples;

    private String phonetics;

    private String partOfSpeech;

    private Double ease;

    private Integer intervalDays;

    private Integer repetitions;

    private Instant nextReviewAt;

    private Instant lastReviewedAt;

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
