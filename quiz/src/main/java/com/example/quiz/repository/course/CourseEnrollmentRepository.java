package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.CourseEnrollment;
import com.example.quiz.base.baseInterface.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends BaseRepository<CourseEnrollment, Long> {
    Optional<CourseEnrollment> findByCourseIdAndUserId(Long courseId, Long userId);
}
