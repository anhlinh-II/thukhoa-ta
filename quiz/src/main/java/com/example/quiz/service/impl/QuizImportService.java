package com.example.quiz.service.impl;

import com.example.quiz.enums.QuestionType;
import com.example.quiz.model.dto.*;
import com.example.quiz.model.entity.question.Question;
import com.example.quiz.model.entity.question_group.QuestionGroup;
import com.example.quiz.model.entity.question_option.QuestionOption;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.repository.question.QuestionRepository;
import com.example.quiz.repository.question_group.QuestionGroupRepository;
import com.example.quiz.repository.question_option.QuestionOptionRepository;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizImportService {
    
    private final QuizMockTestRepository quizMockTestRepository;
    private final QuestionGroupRepository questionGroupRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;

    /**
     * Import quiz from elements
     * Creates quiz, groups, questions, options in a single transaction
     */
    @Transactional(rollbackFor = Exception.class)
    public QuizImportResultDto importQuiz(QuizImportRequestDto request) {
        try {
            Map<String, Integer> created = new HashMap<>();
            List<String> errors = new ArrayList<>();
            
            // 1. Create Quiz Mock Test
            QuizMockTest quiz = new QuizMockTest();
            quiz.setExamName(request.getQuizName());
            quiz.setDescription(request.getDescription());
            quiz.setDurationMinutes(request.getDurationMinutes());
            quiz.setIsActive(true);
            quiz.setIsDeleted(false);

            // Set quiz group if provided
            if (request.getQuizGroupId() != null) {
                QuizGroup quizGroup = new QuizGroup();
                quizGroup.setId(request.getQuizGroupId());
                quiz.setQuizGroup(quizGroup);
            }
            
            quiz = quizMockTestRepository.save(quiz);
            created.put("quizzes", 1);
            
            // 2. Group elements by type
            Map<String, QuestionGroupExcelDto> groupsMap = new LinkedHashMap<>();
            Map<String, QuestionExcelDto> questionsMap = new LinkedHashMap<>();
            Map<String, List<QuestionOptionExcelDto>> optionsByQuestion = new LinkedHashMap<>();
            
            String currentGroupId = null;
            String currentQuestionId = null;
            List<String> currentOptions = new ArrayList<>();
            String currentAnswerKey = null;
            StringBuilder questionContent = new StringBuilder();
            
            for (TextElementDto element : request.getElements()) {
                switch (element.getType()) {
                    case GROUP:
                        // Save previous question if exists
                        if (currentQuestionId != null && !questionsMap.containsKey(currentQuestionId)) {
                            saveQuestion(questionsMap, optionsByQuestion, currentQuestionId,
                                    questionContent.toString(), currentOptions, currentAnswerKey, errors);
                        }
                        
                        // Create new group
                        currentGroupId = UUID.randomUUID().toString();
                        QuestionGroupExcelDto group = new QuestionGroupExcelDto();
                        group.setGroupId(currentGroupId);
                        group.setTitle(element.getText());
                        group.setContentHtml("");
                        groupsMap.put(currentGroupId, group);
                        
                        currentQuestionId = null;
                        questionContent = new StringBuilder();
                        currentOptions.clear();
                        currentAnswerKey = null;
                        break;
                        
                    case QUESTION:
                        // Save previous question if exists
                        if (currentQuestionId != null && !questionsMap.containsKey(currentQuestionId)) {
                            saveQuestion(questionsMap, optionsByQuestion, currentQuestionId,
                                    questionContent.toString(), currentOptions, currentAnswerKey, errors);
                        }
                        
                        // Create new question
                        currentQuestionId = UUID.randomUUID().toString();
                        questionContent = new StringBuilder(element.getText());
                        currentOptions.clear();
                        currentAnswerKey = null;
                        break;
                        
                    case OPTION:
                        if (currentQuestionId != null) {
                            currentOptions.add(element.getText());
                        }
                        break;
                        
                    case ANSWER:
                        if (currentQuestionId != null) {
                            currentAnswerKey = element.getText();
                        }
                        break;
                        
                    case CONTENT:
                        if (currentQuestionId != null) {
                            questionContent.append(" ").append(element.getText());
                        } else if (currentGroupId != null) {
                            QuestionGroupExcelDto group1 = groupsMap.get(currentGroupId);
                            if (group1 != null) {
                                group1.setContentHtml(group1.getContentHtml() + " " + element.getText());
                            }
                        }
                        break;
                }
            }
            
            // Save last question
            if (currentQuestionId != null && !questionsMap.containsKey(currentQuestionId)) {
                saveQuestion(questionsMap, optionsByQuestion, currentQuestionId,
                        questionContent.toString(), currentOptions, currentAnswerKey, errors);
            }
            
            // 3. Create QuestionGroups in DB
            Map<String, QuestionGroup> savedGroups = new HashMap<>();
            for (QuestionGroupExcelDto groupDto : groupsMap.values()) {
                QuestionGroup group = new QuestionGroup();
                group.setTitle(groupDto.getTitle());
                group.setContentHtml(groupDto.getContentHtml());
                group.setMediaUrl(groupDto.getMediaUrl());

                group = questionGroupRepository.save(group);
                savedGroups.put(groupDto.getGroupId(), group);
            }
            created.put("questionGroups", savedGroups.size());
            
            // 4. Create Questions in DB
            Map<String, Question> savedQuestions = new HashMap<>();
            for (QuestionExcelDto questionDto : questionsMap.values()) {
                Question question = new Question();
                question.setType(QuestionType.TEST);
                question.setContentHtml(questionDto.getContentHtml());
                question.setScore(questionDto.getScore() != null ? questionDto.getScore() : 1.0);
                question.setOrderIndex(questionDto.getOrder());
                question.setExplanationHtml(questionDto.getExplanationHtml());

                // Find associated group (first group created or standalone)
                if (!savedGroups.isEmpty()) {
                    question.setGroupId(savedGroups.values().iterator().next().getId());
                }
                
                question = questionRepository.save(question);
                savedQuestions.put(questionDto.getId(), question);
            }
            created.put("questions", savedQuestions.size());
            
            // 5. Create QuestionOptions in DB
            int optionCount = 0;
            for (Map.Entry<String, List<QuestionOptionExcelDto>> entry : optionsByQuestion.entrySet()) {
                Question question = savedQuestions.get(entry.getKey());
                
                if (question == null) {
                    continue;
                }
                
                for (QuestionOptionExcelDto optionDto : entry.getValue()) {
                    QuestionOption option = new QuestionOption();
                    option.setQuestionId(question.getId());
                    option.setIsCorrect(optionDto.getIsCorrect() != null && optionDto.getIsCorrect());
                    option.setContentHtml(optionDto.getContentHtml());
                    option.setMatchKey(optionDto.getMatchKey());
                    option.setOrderIndex(optionDto.getOrder());

                    questionOptionRepository.save(option);
                    optionCount++;
                }
            }
            created.put("questionOptions", optionCount);
            
            log.info("Import completed: {} groups, {} questions, {} options",
                    created.get("questionGroups"),
                    created.get("questions"),
                    created.get("questionOptions"));
            
            return QuizImportResultDto.builder()
                    .created(created)
                    .duration(request.getDurationMinutes())
                    .errors(errors)
                    .build();
            
        } catch (Exception e) {
            log.error("Import failed", e);
            throw new RuntimeException("Import failed: " + e.getMessage(), e);
        }
    }

    /**
     * Helper method to save question with its options
     */
    private void saveQuestion(Map<String, QuestionExcelDto> questions,
                            Map<String, List<QuestionOptionExcelDto>> optionsByQuestion,
                            String questionId, String content, List<String> options,
                            String answerKey, List<String> errors) {
        
        // If no explicit options found, try to split content by common separators
        if (options.isEmpty()) {
            options = tryExtractOptionsFromContent(content);
        }
        
        if (options.isEmpty()) {
            errors.add("Question has no options");
            return;
        }
        
        if (answerKey == null) {
            errors.add("Question has no answer marked");
            return;
        }
        
        QuestionExcelDto question = new QuestionExcelDto();
        question.setId(questionId);
        question.setType("SINGLE_CHOICE");
        question.setContentHtml(escapeHtml(content.trim()));
        question.setScore(1.0);
        question.setOrder(questions.size());
        
        questions.put(questionId, question);
        
        // Create options
        List<QuestionOptionExcelDto> questionOptions = new ArrayList<>();
        for (int i = 0; i < options.size(); i++) {
            QuestionOptionExcelDto option = new QuestionOptionExcelDto();
            option.setQuestionId(questionId);
            option.setMatchKey(String.valueOf((char) ('A' + i)));
            option.setContentHtml(escapeHtml(options.get(i)));
            option.setIsCorrect(option.getMatchKey().equals(answerKey));
            option.setOrder(i);
            
            questionOptions.add(option);
        }
        
        optionsByQuestion.put(questionId, questionOptions);
    }

    /**
     * Try to extract options from content text
     * Handles cases like "Option1 Option2 Option3 Option4" separated by spaces or newlines
     */
    private List<String> tryExtractOptionsFromContent(String content) {
        List<String> extracted = new ArrayList<>();
        
        // Try pattern: multiple parts separated by multiple spaces, tabs, or newlines
        String[] parts = content.trim().split("\\s{2,}|\\n|\\t");
        
        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                extracted.add(trimmed);
            }
        }
        
        // Return if we got 2-4 options
        if (extracted.size() >= 2 && extracted.size() <= 4) {
            log.debug("Extracted {} options from content: {}", extracted.size(), extracted);
            return extracted;
        }
        
        // If not enough options with spaces, try splitting by commas or semicolons
        if (extracted.size() <= 1) {
            extracted.clear();
            parts = content.split("[,;]");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    extracted.add(trimmed);
                }
            }
            if (extracted.size() >= 2 && extracted.size() <= 4) {
                log.debug("Extracted {} options from content (comma/semicolon split): {}", extracted.size(), extracted);
                return extracted;
            }
        }
        
        return new ArrayList<>();
    }

    /**
     * Escape HTML special characters
     */
    private String escapeHtml(String text) {
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
