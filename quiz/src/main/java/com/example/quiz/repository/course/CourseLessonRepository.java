package com.example.quiz.repository.course;

import com.example.quiz.model.entity.course.CourseLesson;
import com.example.quiz.base.baseInterface.BaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseLessonRepository extends BaseRepository<CourseLesson, Long> {

}
