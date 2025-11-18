package com.example.quiz.service.impl;

import com.example.quiz.model.dto.TextElementDto;
import com.example.quiz.model.dto.ExcelPreviewDto;
import com.example.quiz.model.dto.QuestionGroupExcelDto;
import com.example.quiz.model.dto.QuestionExcelDto;
import com.example.quiz.model.dto.QuestionOptionExcelDto;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class WordImportService {

    private static final Pattern OPTION_PATTERN = Pattern.compile("^\\s*([A-D])\\s*[\\)\\.]\\s*(.+)$", Pattern.MULTILINE);
    private static final Pattern GROUP_MARKER = Pattern.compile("^\\[GROUP\\]\\s*(.+)$");
    private static final Pattern QUESTION_MARKER = Pattern.compile("^\\[QUESTION\\]\\s*(.+)$");
    private static final Pattern ANSWER_MARKER = Pattern.compile("^\\[ANSWER\\]\\s*([A-D])$");

    /**
     * Parse Word document and extract text elements with types
     */
    public List<TextElementDto> parseWordDocument(InputStream inputStream) throws Exception {
        List<TextElementDto> elements = new ArrayList<>();
        
        try (XWPFDocument doc = new XWPFDocument(inputStream)) {
            int order = 0;
            
            for (XWPFParagraph paragraph : doc.getParagraphs()) {
                String text = paragraph.getText().trim();
                
                if (text.isEmpty()) {
                    continue;
                }
                
                TextElementDto.ElementType type = detectElementType(paragraph, text);
                
                if (type != null) {
                    TextElementDto element = new TextElementDto();
                    element.setId(UUID.randomUUID().toString());
                    element.setType(type);
                    element.setText(extractContentText(text, type));
                    element.setOrder(order++);
                    elements.add(element);
                }
            }
        }
        
        return elements;
    }

    /**
     * Detect element type from paragraph style and content
     */
    private TextElementDto.ElementType detectElementType(XWPFParagraph paragraph, String text) {
        String style = paragraph.getStyle();
        
        // Heading 1 = GROUP
        if ("Heading1".equalsIgnoreCase(style) || GROUP_MARKER.matcher(text).find()) {
            return TextElementDto.ElementType.GROUP;
        }
        
        // Heading 2 = QUESTION
        if ("Heading2".equalsIgnoreCase(style) || QUESTION_MARKER.matcher(text).find()) {
            return TextElementDto.ElementType.QUESTION;
        }
        
        // Heading 3 = ANSWER
        if ("Heading3".equalsIgnoreCase(style) || ANSWER_MARKER.matcher(text).find()) {
            return TextElementDto.ElementType.ANSWER;
        }
        
        // Check for option pattern A), B), C), D)
        if (OPTION_PATTERN.matcher(text).find()) {
            log.debug("Detected OPTION: {}", text);
            return TextElementDto.ElementType.OPTION;
        }
        
        // Log for debugging
        log.debug("Detected CONTENT: style={}, text={}", style, text.substring(0, Math.min(50, text.length())));
        
        // Default to CONTENT for regular text
        return TextElementDto.ElementType.CONTENT;
    }

    /**
     * Extract clean content text (remove markers)
     */
    private String extractContentText(String text, TextElementDto.ElementType type) {
        switch (type) {
            case GROUP:
                Matcher groupMatcher = GROUP_MARKER.matcher(text);
                if (groupMatcher.find()) {
                    return groupMatcher.group(1).trim();
                }
                return text;
                
            case QUESTION:
                Matcher questionMatcher = QUESTION_MARKER.matcher(text);
                if (questionMatcher.find()) {
                    return questionMatcher.group(1).trim();
                }
                return text;
                
            case ANSWER:
                Matcher answerMatcher = ANSWER_MARKER.matcher(text);
                if (answerMatcher.find()) {
                    return answerMatcher.group(1).trim();
                }
                return text;
                
            default:
                return text;
        }
    }

    /**
     * Convert text elements to Excel preview structure
     * Returns 3 sheets: QuestionGroups, Questions, QuestionOptions
     */
    public ExcelPreviewDto convertToExcelPreview(List<TextElementDto> elements) {
        ExcelPreviewDto preview = new ExcelPreviewDto();
        List<String> errors = new ArrayList<>();
        
        Map<String, QuestionGroupExcelDto> groups = new LinkedHashMap<>();
        Map<String, QuestionExcelDto> questions = new LinkedHashMap<>();
        Map<String, List<QuestionOptionExcelDto>> optionsByQuestion = new LinkedHashMap<>();
        
        String currentGroupId = null;
        String currentQuestionId = null;
        List<String> currentOptions = new ArrayList<>();
        String currentAnswerKey = null;
        StringBuilder questionContent = new StringBuilder();
        
        for (TextElementDto element : elements) {
            switch (element.getType()) {
                case GROUP:
                    // Save previous question if exists
                    if (currentQuestionId != null && !questions.containsKey(currentQuestionId)) {
                        saveQuestion(questions, optionsByQuestion, currentQuestionId, 
                                   questionContent.toString(), currentOptions, currentAnswerKey, errors);
                    }
                    
                    // Create new group
                    currentGroupId = UUID.randomUUID().toString();
                    QuestionGroupExcelDto group = new QuestionGroupExcelDto();
                    group.setGroupId(currentGroupId);
                    group.setTitle(element.getText());
                    group.setContentHtml("");
                    groups.put(currentGroupId, group);
                    
                    currentQuestionId = null;
                    questionContent = new StringBuilder();
                    currentOptions.clear();
                    currentAnswerKey = null;
                    break;
                    
                case QUESTION:
                    // Save previous question if exists
                    if (currentQuestionId != null && !questions.containsKey(currentQuestionId)) {
                        saveQuestion(questions, optionsByQuestion, currentQuestionId, 
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
                        QuestionGroupExcelDto group1 = groups.get(currentGroupId);
                        if (group1 != null) {
                            group1.setContentHtml(group1.getContentHtml() + " " + element.getText());
                        }
                    }
                    break;
            }
        }
        
        // Save last question
        if (currentQuestionId != null && !questions.containsKey(currentQuestionId)) {
            saveQuestion(questions, optionsByQuestion, currentQuestionId, 
                       questionContent.toString(), currentOptions, currentAnswerKey, errors);
        }
        
        // Build question options list for preview
        List<QuestionOptionExcelDto> allOptions = optionsByQuestion.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
        
        preview.setQuestionGroups(new ArrayList<>(groups.values()));
        preview.setQuestions(new ArrayList<>(questions.values()));
        preview.setQuestionOptions(allOptions);
        preview.setErrors(errors);
        
        return preview;
    }

    /**
     * Save question with its options
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
            errors.add("Question '" + content.substring(0, Math.min(50, content.length())) + 
                      "' has no options");
            return;
        }
        
        if (answerKey == null) {
            errors.add("Question '" + content.substring(0, Math.min(50, content.length())) + 
                      "' has no answer marked");
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
            option.setMatchKey(String.valueOf((char)('A' + i)));
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
        
        // If not enough options with spaces, try splitting by common delimiters
        if (extracted.size() <= 1) {
            // Try splitting by commas or semicolons
            parts = content.split("[,;]");
            extracted.clear();
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
