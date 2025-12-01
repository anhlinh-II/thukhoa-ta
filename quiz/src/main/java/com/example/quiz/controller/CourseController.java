package com.example.quiz.controller;

import com.example.quiz.model.entity.course.dto.CourseRequestDto;
import com.example.quiz.model.entity.course.dto.CourseResponseDto;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.service.course.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CourseResponseDto>>> list(Pageable pageable) {
        Page<CourseResponseDto> page = courseService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.successOf(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponseDto>> get(@PathVariable Long id) {
        CourseResponseDto dto = courseService.getById(id);
        return ResponseEntity.ok(ApiResponse.successOf(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponseDto>> create(@RequestBody CourseRequestDto request) {
        CourseResponseDto dto = courseService.create(request);
        return ResponseEntity.ok(ApiResponse.successOf(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponseDto>> update(@PathVariable Long id, @RequestBody CourseRequestDto request) {
        CourseResponseDto dto = courseService.update(id, request);
        return ResponseEntity.ok(ApiResponse.successOf(dto));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<ApiResponse<CourseResponseDto>> enroll(@PathVariable Long id, @RequestParam(required = false) String paymentToken) {
        CourseResponseDto dto = courseService.enroll(id, paymentToken);
        return ResponseEntity.ok(ApiResponse.successOf(dto));
    }
}
