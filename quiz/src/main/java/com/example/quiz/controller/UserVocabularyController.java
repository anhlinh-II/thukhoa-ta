package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.vocab.*;
import com.example.quiz.model.entity.user_vocabulary.UserVocabulary;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyRequest;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyResponse;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyView;
import com.example.quiz.repository.user_vocabulary.UserVocabularyRepository;
import com.example.quiz.service.user_vocabulary.UserVocabularyService;
import com.example.quiz.utils.SecurityUtils;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user-vocabulary")
//@ResourceController("USER_VOCABULARY")
@Slf4j
public class UserVocabularyController extends BaseController<UserVocabulary, Long, UserVocabularyRequest, UserVocabularyResponse, UserVocabularyView, UserVocabularyService> {
    private final UserVocabularyRepository vocabRepo;
    private final UserVocabularyService userVocabularyService;

    private final ObjectMapper mapper = new ObjectMapper();

    public UserVocabularyController(UserVocabularyService service, UserVocabularyRepository vocabRepo, UserVocabularyService userVocabularyService) {
        super(service);
        this.vocabRepo = vocabRepo;
        this.userVocabularyService = userVocabularyService;
    }

    @PostMapping("/save-vocab")
    public ApiResponse<Map<String, Object>> saveVocab(@RequestBody SaveVocabRequest payload) throws JsonProcessingException {
        Long userId = SecurityUtils.getCurrentUserId().orElse(0L);
        String word = payload.getWord() != null ? payload.getWord().trim() : "";
        String language = "en";

        if (userId > 0 && vocabRepo.existsByUserIdAndWordAndLanguage(userId, word, language)) {
            throw new AppException(ErrorCode.ENTITY_EXISTED);
        }

        UserVocabulary v = new UserVocabulary();
        v.setUserId(userId);
        v.setWord(word);
        v.setLanguage(language);

        v.setEase(2.5);
        v.setRepetitions(0);
        v.setIntervalDays(0);
        v.setNextReviewAt(Instant.now());
        v.setLastReviewedAt(null);
        v.setLapses(0);
        v.setConsecutiveFails(0);
        v.setPriority(1.0);

        Map<String, Object> data = payload.getData();
        if (data != null) {
            v.setRawEntry(mapper.writeValueAsString(data));

            Object phonetics = data.get("phonetics");
            if (phonetics != null) {
                v.setPhonetics(mapper.writeValueAsString(phonetics));
            }

            // collect definitions and examples from meanings -> definitions
            Object meaningsObj = data.get("meanings");
            if (meaningsObj instanceof List) {
                List<?> meanings = (List<?>) meaningsObj;
                List<String> defs = new ArrayList<>();
                List<String> examples = new ArrayList<>();
                for (Object m : meanings) {
                    if (m instanceof Map) {
                        Object definitionsObj = ((Map<?, ?>) m).get("definitions");
                        if (definitionsObj instanceof List) {
                            for (Object d : (List<?>) definitionsObj) {
                                if (d instanceof Map) {
                                    Object defText = ((Map<?, ?>) d).get("definition");
                                    if (defText != null)
                                        defs.add(String.valueOf(defText));
                                    Object example = ((Map<?, ?>) d).get("example");
                                    if (example != null)
                                        examples.add(String.valueOf(example));
                                }
                            }
                        }
                    }
                }
                if (!defs.isEmpty()) {
                    try {
                        v.setDefinitions(mapper.writeValueAsString(defs));
                    } catch (Exception ignored) {
                        v.setDefinitions(defs.toString());
                    }
                }
                if (!examples.isEmpty()) {
                    try {
                        v.setExamples(mapper.writeValueAsString(examples));
                    } catch (Exception ignored) {
                        v.setExamples(examples.toString());
                    }
                }
            }
        }

        UserVocabulary saved = vocabRepo.save(v);
        return ApiResponse.successOf(Map.of("id", saved.getId(), "createdAt", saved.getCreatedAt()));
    }

    @PostMapping("/review/question")
    public ApiResponse<ReviewQuestionDto> buildQuestion(@RequestBody ReviewRequestDto req) throws JsonProcessingException {
        ReviewQuestionDto q = this.userVocabularyService.buildQuestionForUser(req.getUserId(), req.getOptionsCount(), req.getVocabId());
        if (q == null) return ApiResponse.successOf(null);
        return ApiResponse.successOf(q);
    }

    @PostMapping("/review/questions")
    public ApiResponse<List<ReviewQuestionDto>> buildQuestions(@RequestBody ReviewBatchRequestDto req) throws JsonProcessingException {
        List<ReviewQuestionDto> qs = this.userVocabularyService.buildQuestionsForUser(req.getUserId(), req.getOptionsCount(), req.getQuestionsCount());
        return ApiResponse.successOf(qs);
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Map<String, Object>> reviewVocab(@PathVariable("id") Long id, @RequestBody ReviewAnswerRequest req) {
        Long currentUser = SecurityUtils.getCurrentUserId().orElse(req.getUserId());
        if (currentUser == null) currentUser = 0L;

        // basic ownership check is inside service
        UserVocabulary saved = this.userVocabularyService.reviewVocabulary(id, currentUser, req.getQuality());
        if (saved == null) return ApiResponse.successOf(Map.of("ok", false));
        Map<String, Object> out = Map.of(
            "ok", true,
            "id", saved.getId(),
            "nextReviewAt", saved.getNextReviewAt(),
            "timeSpentMillis", req.getTimeSpentMillis(),
            "ease", saved.getEase()
        );
        return ApiResponse.successOf(out);
    }
}
