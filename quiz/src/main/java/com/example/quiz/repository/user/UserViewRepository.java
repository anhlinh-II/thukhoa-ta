package com.example.quiz.repository.user;

import com.example.quiz.model.entity.user.UserView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserViewRepository extends JpaRepository<UserView, Long> {
}

