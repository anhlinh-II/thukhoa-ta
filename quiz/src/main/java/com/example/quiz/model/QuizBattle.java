package com.example.quiz.model;

import com.example.quiz.enums.BattleMode;
import com.example.quiz.enums.BattleStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "quiz_battles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizBattle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long quizId;
    
    @Column(name = "quiz_name", length = 500)
    private String quizName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BattleMode battleMode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BattleStatus status = BattleStatus.WAITING;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime startedAt;
    
    private LocalDateTime endedAt;
    
    @Column(columnDefinition = "TEXT")
    private String settings;

    @Column(name = "leader_id")
    private Long leaderId;

    @Column(name = "invite_code", unique = true, length = 6)
    private String inviteCode;
    
    @OneToMany(mappedBy = "battle", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<BattleParticipant> participants = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BattleStatus.WAITING;
        }
    }
}
