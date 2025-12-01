package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.CourseModule;
import com.example.quiz.base.baseInterface.BaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseModuleRepository extends BaseRepository<CourseModule, Long> {

}
