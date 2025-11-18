package com.example.quiz.controller;

import com.example.quiz.model.dto.*;
import com.example.quiz.service.impl.WordImportService;
import com.example.quiz.service.impl.QuizImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/import/quiz")
@RequiredArgsConstructor
public class QuizImportController {
    
    private final WordImportService wordImportService;
    private final QuizImportService quizImportService;

    /**
     * Parse Word file and extract text elements
     */
    @PostMapping("/parse-word")
    public ResponseEntity<Map<String, Object>> parseWord(@RequestParam("wordFile") MultipartFile file) {
        try {
            log.info("Received file: {} (size: {} bytes)", file.getOriginalFilename(), file.getSize());
            
            if (file.isEmpty() || !file.getOriginalFilename().endsWith(".docx")) {
                log.warn("Invalid file: empty={}, name={}", file.isEmpty(), file.getOriginalFilename());
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please upload a valid .docx file"
                ));
            }

            List<TextElementDto> elements = wordImportService.parseWordDocument(file.getInputStream());
            log.info("Parsed {} elements from Word file", elements.size());
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "elements", elements,
                    "count", elements.size()
            ));
        } catch (Exception e) {
            log.error("Error parsing Word file", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to parse Word file: " + e.getMessage()
            ));
        }
    }

    /**
     * Convert text elements to Excel preview structure (3 sheets)
     */
    @PostMapping("/elements-to-excel")
    public ResponseEntity<Map<String, Object>> convertToExcel(@RequestBody Map<String, Object> payload) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> elementMaps = (List<Map<String, Object>>) payload.get("elements");
            
            // Convert maps to DTOs
            List<TextElementDto> elements = elementMaps.stream()
                    .map(map -> TextElementDto.builder()
                            .id((String) map.get("id"))
                            .type(TextElementDto.ElementType.valueOf((String) map.get("type")))
                            .text((String) map.get("text"))
                            .order(((Number) map.get("order")).intValue())
                            .build())
                    .toList();
            
            ExcelPreviewDto preview = wordImportService.convertToExcelPreview(elements);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "preview", preview
            ));
        } catch (Exception e) {
            log.error("Error converting to Excel", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to convert to Excel: " + e.getMessage()
            ));
        }
    }

    /**
     * Process import: create quiz, groups, questions, options
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processImport(@RequestBody QuizImportRequestDto request) {
        try {
            QuizImportResultDto result = quizImportService.importQuiz(request);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "result", result
            ));
        } catch (Exception e) {
            log.error("Error processing import", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to process import: " + e.getMessage()
            ));
        }
    }
}
