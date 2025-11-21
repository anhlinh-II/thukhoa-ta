package com.example.quiz.controller;

import com.example.quiz.model.entity.vocab.UserVocabulary;
import com.example.quiz.repository.vocab.UserVocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vocab")
@RequiredArgsConstructor
@Slf4j
public class VocabController {

    private final UserVocabularyRepository vocabRepo;

    @PostMapping
    public ResponseEntity<?> saveVocab(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = payload.get("userId") != null ? Long.valueOf(String.valueOf(payload.get("userId"))) : 0L;
            String word = String.valueOf(payload.getOrDefault("word", "")).trim();
            String language = String.valueOf(payload.getOrDefault("language", "en"));

            UserVocabulary v = new UserVocabulary();
            v.setUserId(userId);
            v.setWord(word);
            v.setLanguage(language);
            Object defs = payload.get("definitions");
            if (defs != null) v.setDefinitions(defs instanceof String ? (String) defs : defs.toString());
            Object ex = payload.get("examples");
            if (ex != null) v.setExamples(ex instanceof String ? (String) ex : ex.toString());
            Object phon = payload.get("phonetics");
            if (phon != null) v.setPhonetics(phon instanceof String ? (String) phon : phon.toString());
            Object raw = payload.get("raw");
            if (raw != null) v.setRawEntry(raw instanceof String ? (String) raw : raw.toString());
            v.setCreatedAt(LocalDateTime.now());
            v.setUpdatedAt(LocalDateTime.now());

            UserVocabulary saved = vocabRepo.save(v);
            return ResponseEntity.ok(Map.of("id", saved.getId(), "createdAt", saved.getCreatedAt()));
        } catch (Exception e) {
            log.error("Failed to save vocab", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
