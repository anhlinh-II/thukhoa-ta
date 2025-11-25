package com.example.quiz.controller;

import com.example.quiz.model.dto.vocab.ReviewQuestionDto;
import com.example.quiz.model.dto.vocab.ReviewRequestDto;
import com.example.quiz.service.VocabReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vocab")
@RequiredArgsConstructor
public class VocabReviewController {

    private final VocabReviewService reviewService;


}
