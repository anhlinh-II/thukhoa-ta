package com.example.quiz.repository;

import com.example.quiz.model.view.UserView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserViewRepository extends JpaRepository<UserView, Long> {
}

