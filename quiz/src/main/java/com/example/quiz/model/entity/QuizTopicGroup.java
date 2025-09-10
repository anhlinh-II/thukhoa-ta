//package com.example.quiz.model.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.SuperBuilder;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "quiz_topic_group")
//@DiscriminatorValue("TOPIC")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@SuperBuilder
//public class QuizTopicGroup extends QuizGroup {
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "topic_category", nullable = false)
//    private TopicCategory category;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "difficulty_level", nullable = false)
//    private DifficultyLevel level;
//
//    @Column(columnDefinition = "TEXT")
//    private String prerequisites;
//
//    @Column(name = "learning_objectives", columnDefinition = "TEXT")
//    private String learningObjectives;
//
//    @Column(name = "recommended_order")
//    private Integer recommendedOrder;
//
//    @OneToMany(mappedBy = "quizGroup", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @OrderBy("displayOrder ASC")
//    @Builder.Default
//    private List<QuizTopic> quizzes = new ArrayList<>();
//
//    public enum TopicCategory {
//        GRAMMAR("Grammar"),
//        VOCABULARY("Vocabulary"),
//        READING("Reading Comprehension"),
//        LISTENING("Listening Skills"),
//        SPEAKING("Speaking Practice"),
//        WRITING("Writing Skills"),
//        MATH("Mathematics"),
//        PHYSICS("Physics"),
//        CHEMISTRY("Chemistry"),
//        BIOLOGY("Biology"),
//        HISTORY("History"),
//        GEOGRAPHY("Geography"),
//        LITERATURE("Literature");
//
//        private final String displayName;
//
//        TopicCategory(String displayName) {
//            this.displayName = displayName;
//        }
//
//        public String getDisplayName() {
//            return displayName;
//        }
//    }
//
//    public enum DifficultyLevel {
//        BASIC("Basic"),
//        INTERMEDIATE("Intermediate"),
//        ADVANCED("Advanced");
//
//        private final String displayName;
//
//        DifficultyLevel(String displayName) {
//            this.displayName = displayName;
//        }
//
//        public String getDisplayName() {
//            return displayName;
//        }
//    }
//}
