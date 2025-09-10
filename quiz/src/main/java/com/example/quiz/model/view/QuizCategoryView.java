package com.example.quiz.model.view;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import net.jcip.annotations.Immutable;
import org.hibernate.annotations.Subselect;

@Immutable
@Subselect("SELECT * FROM quiz_category_view")
@Entity
@Getter
@Setter
public class QuizCategoryView {
    @Id
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long quizCount;
}
