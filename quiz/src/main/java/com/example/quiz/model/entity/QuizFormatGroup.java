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
//@Table(name = "quiz_format_group")
//@DiscriminatorValue("FORMAT")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@SuperBuilder
//public class QuizFormatGroup extends QuizGroup {
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "format_type", nullable = false)
//    private FormatType formatType;
//
//    @Column(name = "time_limit_per_question")
//    private Integer timeLimitPerQuestion; // seconds
//
//    @Column(name = "shuffle_questions")
//    @Builder.Default
//    private Boolean shuffleQuestions = false;
//
//    @Column(name = "show_correct_answers")
//    @Builder.Default
//    private Boolean showCorrectAnswers = true;
//
//    @Column(name = "auto_submit")
//    @Builder.Default
//    private Boolean autoSubmit = false;
//
//    @OneToMany(mappedBy = "quizGroup", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @OrderBy("displayOrder ASC")
//    @Builder.Default
//    private List<QuizFormat> quizzes = new ArrayList<>();
//
//    public enum FormatType {
//        MULTIPLE_CHOICE("Multiple Choice"),
//        TRUE_FALSE("True/False"),
//        FILL_BLANK("Fill in the Blank"),
//        ESSAY("Essay"),
//        MATCHING("Matching");
//
//        private final String displayName;
//
//        FormatType(String displayName) {
//            this.displayName = displayName;
//        }
//
//        public String getDisplayName() {
//            return displayName;
//        }
//    }
//}
