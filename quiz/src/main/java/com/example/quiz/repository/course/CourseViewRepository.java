package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseViewRepository extends JpaRepository<Course, Long> {

}
