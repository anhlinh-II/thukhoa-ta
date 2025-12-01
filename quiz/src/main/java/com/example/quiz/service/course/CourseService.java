package com.example.quiz.service.course;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.course.Course;
import com.example.quiz.model.entity.course.dto.CourseRequestDto;
import com.example.quiz.model.entity.course.dto.CourseResponseDto;

public interface CourseService extends BaseService<Course, Long, CourseRequestDto, CourseResponseDto, Course> {
    CourseResponseDto enroll(Long courseId, String paymentToken);
}
