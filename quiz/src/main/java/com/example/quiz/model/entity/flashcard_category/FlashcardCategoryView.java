package com.example.quiz.model.entity.flashcard_category;

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

@Immutable
@Entity
@Subselect("""
    SELECT * FROM flashcard_category_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardCategoryView extends BaseView {
    @Id
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "color")
    private String color;

    @Column(name = "icon")
    private String icon;

    @Column(name = "card_count")
    private Integer cardCount;

    @Column(name = "is_public")
    private Boolean isPublic;
}
