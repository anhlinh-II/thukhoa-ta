package com.example.quiz.service.course.impl;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.course.Course;
import com.example.quiz.model.entity.course.dto.CourseRequestDto;
import com.example.quiz.model.entity.course.dto.CourseResponseDto;
import com.example.quiz.mapper.CourseMapper;
import com.example.quiz.repository.course.CourseRepository;
import com.example.quiz.service.course.CourseService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.repository.course.CourseViewRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class CourseServiceImpl extends BaseServiceImpl<Course, Long, CourseRequestDto, CourseResponseDto, Course> implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseViewRepository courseViewRepository;
    private final CourseMapper courseMapper;

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    public CourseServiceImpl(
            com.example.quiz.base.impl.AdvancedFilterService advancedFilterService,
            CourseRepository courseRepository,
            CourseViewRepository courseViewRepository,
            CourseMapper mapper) {
        super(advancedFilterService, courseRepository, mapper, courseViewRepository);
        this.courseRepository = courseRepository;
        this.courseViewRepository = courseViewRepository;
        this.courseMapper = mapper;
    }

    @Override
    public CourseResponseDto enroll(Long courseId, String paymentToken) {
        // Enrollment business logic placeholder
        // For now, simply return the course response if exists
        Course c = this.findById(courseId);
        return courseMapper.entityToResponse(c);
    }

    @Override
    protected Class<Course> getViewClass() {
        return Course.class;
    }

    @Override
    public Page<CourseResponseDto> getAll(Pageable pageable) {
        return super.getAll(pageable);
    }
}
