package com.example.quiz.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "battle_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleParticipant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battle_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private QuizBattle battle;
    
    @Column(nullable = false)
    private Long userId;
    
    private Integer teamId;
    
    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();
    
    private Integer score = 0;
    
    private LocalDateTime completedAt;
    
    @Column(columnDefinition = "TEXT")
    private String answers;
    
    @Column(columnDefinition = "TEXT")
    private String suspiciousFlags;
    
    private String ipAddress;
    
    private String userAgent;
    
    private Integer tabSwitchCount = 0;
    
    @Column(nullable = false)
    private Boolean isReady = false;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        if (score == null) score = 0;
        if (tabSwitchCount == null) tabSwitchCount = 0;
        if (isReady == null) isReady = false;
    }
}
