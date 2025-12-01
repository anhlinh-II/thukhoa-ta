package com.example.quiz.model.entity.course;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.utils.Sluggable;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;
import lombok.Builder;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Course extends BaseEntity implements Sluggable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_paid")
    @Builder.Default
    private Boolean isPaid = false;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Override
    public String getSlugSource() {
        return this.name;
    }
}
