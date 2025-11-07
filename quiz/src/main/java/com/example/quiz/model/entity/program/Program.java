package com.example.quiz.model.entity.program;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.utils.Sluggable;
import com.example.quiz.utils.SlugEntityListener;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@EntityListeners(SlugEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "programs")
public class Program extends BaseEntity implements Sluggable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false, length = 255)
    String name;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "slug", unique = true, length = 255)
    String slug;

    @Column(name = "level", nullable = false)
    Integer level; // 1=Beginner, 2=Intermediate, 3=Advanced

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    Integer displayOrder = 0;

    // Self-referential relationship for hierarchy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    Program parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Program> children;

    @Column(name = "image_url")
    String imageUrl;

    // Helper methods
    public boolean isLeaf() {
        return children == null || children.isEmpty();
    }

    public boolean isRoot() {
        return parent == null;
    }

    public boolean canHaveQuizzes() {
        return isLeaf();
    }

    public int getDepth() {
        int depth = 0;
        Program current = this.parent;
        while (current != null) {
            depth++;
            current = current.getParent();
        }
        return depth;
    }
    
    @Override
    public String getSlugSource() {
        return this.name;
    }

    @Override
    public void setSlug(String slug) {
        this.slug = slug;
    }

    @Override
    public String getSlug() {
        return this.slug;
    }

}
