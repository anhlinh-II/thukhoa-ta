package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.course.Course;
import com.example.quiz.model.entity.course.dto.CourseRequestDto;
import com.example.quiz.model.entity.course.dto.CourseResponseDto;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper extends BaseMapstruct<Course, CourseRequestDto, CourseResponseDto, Course> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Course requestToEntity(CourseRequestDto request);

    @Override
    CourseResponseDto entityToResponse(Course entity);

    @Override
    CourseResponseDto viewToResponse(Course view);
}
