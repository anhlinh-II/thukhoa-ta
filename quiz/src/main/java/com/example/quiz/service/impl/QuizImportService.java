package com.example.quiz.service.impl;

import com.example.quiz.enums.QuestionType;
import com.example.quiz.enums.QuizType;
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
import org.springframework.web.util.HtmlUtils;

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
    // @Transactional(rollbackFor = Exception.class)
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
            
            QuestionGroupExcelDto currentGroup = null;
            QuestionExcelDto currentQuestion = null;
            List<String> currentOptions = new ArrayList<>();
            String currentAnswerKey = null;
            StringBuilder questionContent = new StringBuilder();
            
            for (TextElementDto element : request.getElements()) {
                switch (element.getType()) {
                    case GROUP:
                        // Save previous question if exists
                        if (currentQuestion != null) {
                            saveQuestionOptions(currentQuestion, currentOptions, currentAnswerKey, questionsMap, optionsByQuestion, errors);
                        }
                        
                        // Create new group
                        currentGroup = new QuestionGroupExcelDto();
                        currentGroup.setTitle(element.getText());
                        currentGroup.setContentHtml("");
                        groupsMap.put("group_" + groupsMap.size(), currentGroup);
                        
                        currentQuestion = null;
                        questionContent = new StringBuilder();
                        currentOptions.clear();
                        currentAnswerKey = null;
                        break;
                        
                    case QUESTION:
                        // Save previous question if exists
                        if (currentQuestion != null) {
                            saveQuestionOptions(currentQuestion, currentOptions, currentAnswerKey, questionsMap, optionsByQuestion, errors);
                        }
                        
                        // Create new question
                        currentQuestion = new QuestionExcelDto();
                        currentQuestion.setContentHtml(element.getText());
                        currentQuestion.setScore(1.0);
                        currentQuestion.setOrder(questionsMap.size());
                        
                        questionContent = new StringBuilder(element.getText());
                        currentOptions.clear();
                        currentAnswerKey = null;
                        break;
                        
                    case OPTION:
                        if (currentQuestion != null) {
                            currentOptions.add(element.getText());
                        }
                        break;
                        
                    case ANSWER:
                        if (currentQuestion != null) {
                            currentAnswerKey = element.getText();
                        }
                        break;
                        
                    case CONTENT:
                        // Check if this CONTENT element could be an OPTION
                        if (currentQuestion != null && currentOptions.size() < 4) {
                            // Try to detect if this looks like an option
                            String text = element.getText().trim();
                            if (isLikelyAnOption(text)) {
                                currentOptions.add(text);
                                log.debug("Treated CONTENT as OPTION: {}", text);
                            } else if (questionContent.length() > 0) {
                                // Append to question content
                                questionContent.append(" ").append(text);
                                currentQuestion.setContentHtml(questionContent.toString());
                            }
                        } else if (currentGroup != null) {
                            currentGroup.setContentHtml(currentGroup.getContentHtml() + " " + element.getText());
                        }
                        break;
                }
            }
            
            // Save last question
            if (currentQuestion != null) {
                saveQuestionOptions(currentQuestion, currentOptions, currentAnswerKey, questionsMap, optionsByQuestion, errors);
            }
            
            // 3. Create QuestionGroups in DB
            Map<String, QuestionGroup> savedGroups = new HashMap<>();
            for (Map.Entry<String, QuestionGroupExcelDto> entry : groupsMap.entrySet()) {
                QuestionGroup group = new QuestionGroup();
                group.setTitle(entry.getValue().getTitle());
                group.setContentHtml(entry.getValue().getContentHtml());
                group.setMediaUrl(entry.getValue().getMediaUrl());

                group = questionGroupRepository.save(group);
                savedGroups.put(entry.getKey(), group);
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
                question.setQuizId(quiz.getId());
                question.setQuizType(QuizType.QUIZ_MOCK_TEST);
                question.setExplanationHtml(questionDto.getExplanationHtml());

                // Find associated group (first group created or standalone)
                if (!savedGroups.isEmpty()) {
                    question.setGroupId(savedGroups.values().iterator().next().getId());
                }
                
                question = questionRepository.save(question);
                savedQuestions.put("question_" + savedQuestions.size(), question);
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
    private void saveQuestionOptions(QuestionExcelDto question, List<String> options,
                                   String answerKey, Map<String, QuestionExcelDto> questionsMap,
                                   Map<String, List<QuestionOptionExcelDto>> optionsByQuestion,
                                   List<String> errors) {
        
        // If no explicit options found, try to split content by common separators
        if (options.isEmpty()) {
            options = tryExtractOptionsFromContent(question.getContentHtml());
        }
        
        if (options.isEmpty()) {
            errors.add("Question has no options");
            return;
        }
        
        if (answerKey == null) {
            errors.add("Question has no answer marked");
            return;
        }
        
        question.setType("SINGLE_CHOICE");
        question.setScore(1.0);
        question.setContentHtml(HtmlUtils.htmlEscape(question.getContentHtml().trim()));
        
        questionsMap.put("question_" + questionsMap.size(), question);
        
        // Create options
        List<QuestionOptionExcelDto> questionOptions = new ArrayList<>();
        for (int i = 0; i < options.size(); i++) {
            QuestionOptionExcelDto option = new QuestionOptionExcelDto();
            option.setMatchKey(String.valueOf((char) ('A' + i)));
            option.setContentHtml(HtmlUtils.htmlEscape(options.get(i)));
            option.setIsCorrect(option.getMatchKey().equals(answerKey));
            option.setOrder(i);
            
            questionOptions.add(option);
        }
        
        optionsByQuestion.put("question_" + (questionsMap.size() - 1), questionOptions);
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
     * Check if text looks like an option (starts with A., B., etc. or is short)
     */
    private boolean isLikelyAnOption(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        String trimmed = text.trim();
        
        // Check for explicit option markers: A., B., C., D., A), B), etc.
        if (trimmed.matches("^[A-D][.)]\\s*.+") || 
            trimmed.matches("^[1-4][.)]\\s*.+")) {
            return true;
        }
        
        // Check if it's a short text (likely an option) and doesn't look like a question
        if (trimmed.length() < 100 && !trimmed.contains("?") && 
            !trimmed.toLowerCase().contains("câu") && 
            !trimmed.toLowerCase().contains("question")) {
            return true;
        }
        
        return false;
    }
}
