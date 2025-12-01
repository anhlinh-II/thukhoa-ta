package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.Course;
import com.example.quiz.base.baseInterface.BaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends BaseRepository<Course, Long> {

}
