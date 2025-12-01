package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.CourseEntitlement;
import com.example.quiz.base.baseInterface.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseEntitlementRepository extends BaseRepository<CourseEntitlement, Long> {
    List<CourseEntitlement> findByEnrollmentId(Long enrollmentId);
}
