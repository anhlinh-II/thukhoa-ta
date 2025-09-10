package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.dto.request.ProgramRequestDto;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.ProgramResponseDto;
import com.example.quiz.model.entity.Program;
import com.example.quiz.model.view.ProgramView;
import com.example.quiz.service.ProgramService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/programs")
@ResourceController("PROGRAM")
@Slf4j
public class ProgramController extends BaseController<Program, Long, ProgramRequestDto, ProgramResponseDto, ProgramView, ProgramService> {

    public ProgramController(ProgramService programService) {
        super(programService);
    }

    // Chỉ cần thêm specialized methods với empty resource (sẽ auto-fill thành "PROGRAM")
    @GetMapping("/roots")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getRootPrograms() {
        log.info("Getting root programs");
        List<ProgramResponseDto> response = service.getRootPrograms();
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/{parentId}/children")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getChildrenPrograms(
            @PathVariable Long parentId) {
        log.info("Getting children programs for parent: {}", parentId);
        List<ProgramResponseDto> response = service.getChildrenPrograms(parentId);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }
    
    @GetMapping("/specialized-example")
    @RequirePermission(resource = "", action = "READ") 
    public ResponseEntity<ApiResponse<String>> specializedExample() {
        log.info("Using specialized ProgramService method");
        return ResponseEntity.ok(ApiResponse.successOf("Specialized method called"));
    }

    @PutMapping("/{programId}/move")
    @RequirePermission(resource = "", action = "UPDATE")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> moveProgram(
            @PathVariable Long programId,
            @RequestParam(required = false) Long newParentId) {
        log.info("Moving program {} to parent: {}", programId, newParentId);
        ProgramResponseDto response = service.moveProgram(programId, newParentId);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/hierarchy")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getProgramHierarchy() {
        log.info("Getting program hierarchy");
        List<ProgramResponseDto> response = service.getProgramHierarchy();
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/{rootId}/tree")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getProgramTree(@PathVariable Long rootId) {
        log.info("Getting program tree for root: {}", rootId);
        List<ProgramResponseDto> response = service.getProgramTree(rootId);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    // Level-based and filtering endpoints
    @GetMapping("/level/{level}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getProgramsByLevel(@PathVariable Integer level) {
        log.info("Getting programs by level: {}", level);
        List<ProgramResponseDto> response = service.getProgramsByLevel(level);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/leaf")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> getLeafPrograms() {
        log.info("Getting leaf programs");
        List<ProgramResponseDto> response = service.getLeafPrograms();
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/search")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> searchPrograms(@RequestParam String name) {
        log.info("Searching programs with name: {}", name);
        List<ProgramResponseDto> response = service.searchProgramsByName(name);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    // Statistics and validation endpoints
    @GetMapping("/{id}/statistics")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<ProgramResponseDto>> getProgramWithStatistics(@PathVariable Long id) {
        log.info("Getting program statistics for id: {}", id);
        ProgramResponseDto response = service.getProgramWithStatistics(id);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/{id}/can-have-quizzes")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<Boolean>> canHaveQuizzes(@PathVariable Long id) {
        log.info("Checking if program {} can have quizzes", id);
        boolean response = service.canHaveQuizzes(id);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    @GetMapping("/{programId}/can-be-parent/{childId}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<Boolean>> canBeParent(
            @PathVariable Long programId,
            @PathVariable Long childId) {
        log.info("Checking if program {} can be parent of {}", programId, childId);
        boolean response = service.canBeParent(programId, childId);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }

    // Bulk operations
    @PutMapping("/reorder")
    @RequirePermission(resource = "", action = "UPDATE")
    public ResponseEntity<ApiResponse<List<ProgramResponseDto>>> reorderPrograms(
            @RequestParam List<Long> programIds,
            @RequestParam List<Integer> displayOrders) {
        log.info("Reordering programs: {} with orders: {}", programIds, displayOrders);
        List<ProgramResponseDto> response = service.reorderPrograms(programIds, displayOrders);
        return ResponseEntity.ok(ApiResponse.successOf(response));
    }
}
// tôi đang thiết kế cho học sinh cấp 2 và cấp 3 việt nam và có thể mở rộng ra các chứng chỉ khác cho sinh viên học sinh,, lưu vào project context thông tin này