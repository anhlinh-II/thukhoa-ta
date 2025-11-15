package com.example.quiz.model.entity.role_permission;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "permissions")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String resource; // e.g., "USER", "QUIZ", "CATEGORY"

    @Column(nullable = false)
    private String action; // e.g., "CREATE", "READ", "UPDATE", "DELETE"

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonBackReference(value = "role_permission")
    private Set<Role> roles;

    public Permission(String name, String description, String resource, String action) {
        this.name = name;
        this.description = description;
        this.resource = resource;
        this.action = action;
    }
}
