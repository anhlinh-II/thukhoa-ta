package com.example.quiz.service.user_vocabulary;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.UserVocabularyMapper;
import com.example.quiz.model.dto.vocab.ReviewOptionDto;
import com.example.quiz.model.dto.vocab.ReviewQuestionDto;
import com.example.quiz.model.entity.user_vocabulary.UserVocabulary;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyRequest;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyResponse;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyView;
import com.example.quiz.repository.user_vocabulary.UserVocabularyRepository;
import com.example.quiz.repository.user_vocabulary.UserVocabularyViewRepository;
import com.example.quiz.service.CuratedPoolLoader;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserVocabularyServiceImpl extends BaseServiceImpl<UserVocabulary, Long, UserVocabularyRequest, UserVocabularyResponse, UserVocabularyView> implements UserVocabularyService {
    private final UserVocabularyViewRepository viewRepo;
    private final UserVocabularyRepository vocabRepo;
    private final CuratedPoolLoader poolLoader;

    private final ObjectMapper mapper = new ObjectMapper();

    public UserVocabularyServiceImpl(
            AdvancedFilterService advancedFilterService,
            UserVocabularyRepository repository,
            UserVocabularyMapper mapper,
            UserVocabularyViewRepository viewRepository,
            CuratedPoolLoader poolLoader,
            UserVocabularyRepository vocabRepo) {
        super(advancedFilterService, repository, mapper, viewRepository);
        this.viewRepo = viewRepository;
        this.poolLoader = poolLoader;
        this.vocabRepo = vocabRepo;
    }

    @Override
    protected Class<UserVocabularyView> getViewClass() {
        return UserVocabularyView.class;
    }

    @Override
    public ReviewQuestionDto buildQuestionForUser(Long userId, Integer optionsCount, Long vocabIdOpt) throws JsonProcessingException {
        List<UserVocabulary> userVocabs = vocabRepo.findByUserId(userId == null ? -1L : userId);

        // pick target vocab
        // lấy từ vựng dựa theo optional vocabId
        UserVocabulary target = null;
        if (vocabIdOpt != null) {
            for (UserVocabulary v : userVocabs)
                if (Objects.equals(v.getId(), vocabIdOpt)) {
                    target = v;
                    break;
                }
        }
        if (target == null) {
            // prefer due items
            List<UserVocabulary> due = userVocabs.stream()
                    .filter(vocabulary -> vocabulary.getNextReviewAt() == null || vocabulary.getNextReviewAt().isBefore(Instant.now()))
                    .collect(Collectors.toList());
            List<UserVocabulary> pool = due.isEmpty() ? userVocabs : due;
            if (!pool.isEmpty()) target = pool.get(new Random().nextInt(pool.size()));
        }

        // if still null, fallback to curated pool random
        if (target == null) {
            Map<String, Object> entry = pickRandomFromCurated();
            if (entry == null) return null;
            String word = (String) entry.get("word");
            List<Map<String, Object>> defs = normalizeDefinitions(entry.get("definitions"));
            if (defs.isEmpty()) return null;
            String defText = (String) defs.get(0).get("definition");
            ReviewOptionDto opt = new ReviewOptionDto(UUID.randomUUID().toString(), defText, "pool");
            ReviewQuestionDto q = new ReviewQuestionDto(null, word, "Choose the correct definition:", Collections.singletonList(opt), 0, null);
            return q;
        }

        // parse definitions of target
        List<String> targetDefinitions = parseDefinitions(target);
        if (targetDefinitions.isEmpty()) return null;
        String correctDef = targetDefinitions.get(0);

        String targetPos = target.getPartOfSpeech();

        // collect distractors from other user vocabs with same POS
        List<String> distractors = new ArrayList<>();
        for (UserVocabulary v : userVocabs) {
            if (Objects.equals(v.getId(), target.getId())) continue; // NEVER use same-word definitions
            if (targetPos != null && v.getPartOfSpeech() != null && !v.getPartOfSpeech().equalsIgnoreCase(targetPos))
                continue;
            List<String> defs = parseDefinitions(v);
            if (!defs.isEmpty()) distractors.add(defs.get(0));
            if (distractors.size() >= (optionsCount == null ? 4 : optionsCount) - 1) break;
        }

        // fallback to curated pool
        int need = (optionsCount == null ? 4 : optionsCount) - 1 - distractors.size();
        if (need > 0) {
            List<String> poolDefs = pickDefinitionsFromCurated(targetPos, need, target.getWord());
            distractors.addAll(poolDefs);
        }

        // build options list (correct + distractors)
        List<ReviewOptionDto> options = new ArrayList<>();
        options.add(new ReviewOptionDto(UUID.randomUUID().toString(), correctDef, "user"));
        for (String d : distractors) options.add(new ReviewOptionDto(UUID.randomUUID().toString(), d, "user"));

        // shuffle and find correct index
        Collections.shuffle(options);
        int correctIndex = -1;
        for (int i = 0; i < options.size(); i++)
            if (options.get(i).getText().equals(correctDef)) {
                correctIndex = i;
                break;
            }

        ReviewQuestionDto question = new ReviewQuestionDto(target.getId(), target.getWord(), "Choose the correct definition:", options, correctIndex, target.getEase());
        return question;
    }

    @Override
    public List<ReviewQuestionDto> buildQuestionsForUser(Long userId, Integer optionsCount, Integer questionsCount) throws JsonProcessingException {
        if (optionsCount == null || optionsCount < 2) optionsCount = 4;
        if (questionsCount == null || questionsCount < 1) questionsCount = 1;

        List<UserVocabulary> allVocabs = vocabRepo.findByUserId(userId == null ? -1L : userId);
        // only due vocab
        List<UserVocabulary> due = allVocabs.stream()
                .filter(vocabulary -> vocabulary.getNextReviewAt() == null || vocabulary.getNextReviewAt().isBefore(Instant.now()))
                .toList();

        if (due.isEmpty()) {
            // no due items -> return empty list (caller may fallback)
            return Collections.emptyList();
        }

        int poolSize = Math.max(1, due.size() * 3);

        // build candidate pool from allVocabs (randomized)
        List<UserVocabulary> candidates = new ArrayList<>(allVocabs);
        Collections.shuffle(candidates);
        if (candidates.size() > poolSize) candidates = candidates.subList(0, poolSize);

        List<ReviewQuestionDto> out = new ArrayList<>();

        Random rnd = new Random();

        // limit to questionsCount
        int limit = Math.min(questionsCount, due.size());
        List<UserVocabulary> targets = new ArrayList<>(due);
        Collections.shuffle(targets);

        for (int ti = 0; ti < limit; ti++) {
            UserVocabulary target = targets.get(ti);
            List<String> targetDefinitions = parseDefinitions(target);
            if (targetDefinitions.isEmpty()) continue; // skip
            String correctDef = targetDefinitions.get(0);

            // sample distractors from candidates (ensure not same vocab)
            List<String> distractors = new ArrayList<>();
            for (UserVocabulary c : candidates) {
                if (Objects.equals(c.getId(), target.getId())) continue;
                List<String> defs = parseDefinitions(c);
                if (defs.isEmpty()) continue;
                String d0 = defs.get(0);
                if (d0.equals(correctDef)) continue;
                if (!distractors.contains(d0)) distractors.add(d0);
                if (distractors.size() >= (optionsCount - 1)) break;
            }

            // fallback to curated pool if not enough
            if (distractors.size() < (optionsCount - 1)) {
                int need = (optionsCount - 1) - distractors.size();
                List<String> poolDefs = pickDefinitionsFromCurated(target.getPartOfSpeech(), need, target.getWord());
                for (String s : poolDefs) {
                    if (!distractors.contains(s) && !s.equals(correctDef)) distractors.add(s);
                    if (distractors.size() >= (optionsCount - 1)) break;
                }
            }

            // build options
            List<ReviewOptionDto> options = new ArrayList<>();
            options.add(new ReviewOptionDto(UUID.randomUUID().toString(), correctDef, "user"));
            for (String d : distractors) options.add(new ReviewOptionDto(UUID.randomUUID().toString(), d, "user"));

            // if still not enough (rare), continue to next
            if (options.size() < optionsCount) continue;

            Collections.shuffle(options, rnd);
            int correctIndex = -1;
            for (int i = 0; i < options.size(); i++)
                if (options.get(i).getText().equals(correctDef)) {
                    correctIndex = i;
                    break;
                }

            ReviewQuestionDto question = new ReviewQuestionDto(target.getId(), target.getWord(), "Choose the correct definition:", options, correctIndex, target.getEase());
            out.add(question);
        }

        return out;
    }

    @Override
    public UserVocabulary reviewVocabulary(Long vocabId, Long userId, Double quality) {
        Optional<UserVocabulary> opt = vocabRepo.findById(vocabId);
        if (opt.isEmpty()) return null;
        UserVocabulary vocab = opt.get();
        if (vocab.getUserId() == null || !Objects.equals(vocab.getUserId(), userId)) return null;

        double ef = vocab.getEase() == null ? 2.5 : vocab.getEase();
        Double q = quality;
        double newEf = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (newEf < 1.3) newEf = 1.3;

        if (q >= 3) {
            int prevReps = vocab.getRepetitions() == null ? 0 : vocab.getRepetitions();
            int newReps = prevReps + 1;
            int newInterval;
            if (prevReps == 0) newInterval = 1;
            else if (prevReps == 1) newInterval = 6;
            else {
                int prevInterval = vocab.getIntervalDays() == null ? 1 : vocab.getIntervalDays();
                newInterval = (int) Math.round(prevInterval * newEf);
            }

            vocab.setRepetitions(newReps);
            vocab.setIntervalDays(newInterval);
            vocab.setConsecutiveFails(0);
        } else {
            vocab.setRepetitions(0);
            vocab.setIntervalDays(1);
            vocab.setConsecutiveFails((vocab.getConsecutiveFails() == null ? 0 : vocab.getConsecutiveFails()) + 1);
            vocab.setLapses((vocab.getLapses() == null ? 0 : vocab.getLapses()) + 1);
        }

        vocab.setEase(newEf);
        vocab.setLastReviewedAt(Instant.now());

        int intervalDays = vocab.getIntervalDays() == null ? 1 : vocab.getIntervalDays();
        vocab.setNextReviewAt(Instant.now().plusSeconds(60L * 60 * 24 * intervalDays));

        vocab.setPriority(1.0 / Math.max(1, intervalDays));

        return vocabRepo.save(vocab);
    }

    private List<String> parseDefinitions(UserVocabulary v) {
        if (v.getDefinitions() == null) return Collections.emptyList();
        String raw = v.getDefinitions();
        try {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(raw);
            List<String> out = new ArrayList<>();

            if (root.isTextual()) {
                String txt = root.asText();
                if (txt != null && !txt.trim().isEmpty()) out.add(txt);
                return out;
            }

            if (root.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode el : root) {
                    if (el == null) continue;
                    if (el.isTextual()) {
                        out.add(el.asText());
                    } else if (el.isObject()) {
                        com.fasterxml.jackson.databind.JsonNode dnode = el.get("definition");
                        if (dnode != null && dnode.isTextual()) out.add(dnode.asText());
                        else {
                            java.util.Iterator<java.util.Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = el.fields();
                            if (fields.hasNext()) {
                                com.fasterxml.jackson.databind.JsonNode val = fields.next().getValue();
                                if (val != null && val.isTextual()) out.add(val.asText());
                            }
                        }
                    } else {
                        out.add(el.toString());
                    }
                }
                return out;
            }

            if (root.isObject()) {
                com.fasterxml.jackson.databind.JsonNode dnode = root.get("definition");
                if (dnode != null && dnode.isTextual()) return Collections.singletonList(dnode.asText());
                return Collections.singletonList(root.toString());
            }

            if (raw != null && !raw.trim().isEmpty()) return Collections.singletonList(raw);
            return Collections.emptyList();
        } catch (Exception e) {
            if (raw == null || raw.trim().isEmpty()) return Collections.emptyList();
            return Collections.singletonList(raw);
        }
    }

    private Map<String, Object> pickRandomFromCurated() {
        List<Map<String, Object>> pool = poolLoader.getPool();
        if (pool == null || pool.isEmpty()) return null;
        return pool.get(new Random().nextInt(pool.size()));
    }

    /**
     * Normalize various shapes of 'definitions' coming from curated pool.
     * Supports: List<Map>, List<String>, JSON string representing array/object, single object, etc.
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> normalizeDefinitions(Object defsObj) {
        if (defsObj == null) return Collections.emptyList();

        try {
            List<Map<String, Object>> out = new ArrayList<>();

            if (defsObj instanceof List) {
                for (Object el : (List<?>) defsObj) {
                    if (el instanceof Map) {
                        out.add((Map<String, Object>) el);
                    } else if (el instanceof String) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("definition", (String) el);
                        out.add(m);
                    } else {
                        Map<String, Object> m = new HashMap<>();
                        m.put("definition", String.valueOf(el));
                        out.add(m);
                    }
                }
                return out;
            }

            // If it's a string, try parse as JSON
            if (defsObj instanceof String) {
                String raw = (String) defsObj;
                if (raw.trim().isEmpty()) return Collections.emptyList();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(raw);
                if (root.isArray()) {
                    for (com.fasterxml.jackson.databind.JsonNode el : root) {
                        if (el.isObject()) {
                            Map<String, Object> m = mapper.convertValue(el, new TypeReference<Map<String, Object>>() {});
                            out.add(m);
                        } else if (el.isTextual()) {
                            Map<String, Object> m = new HashMap<>();
                            m.put("definition", el.asText());
                            out.add(m);
                        } else {
                            Map<String, Object> m = new HashMap<>();
                            m.put("definition", el.toString());
                            out.add(m);
                        }
                    }
                    return out;
                } else if (root.isObject()) {
                    Map<String, Object> m = mapper.convertValue(root, new TypeReference<Map<String, Object>>() {});
                    return Collections.singletonList(m);
                } else if (root.isTextual()) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("definition", root.asText());
                    return Collections.singletonList(m);
                }
            }

            // Last resort: convert via mapper (may handle LinkedHashMap etc.)
            Map<String, Object> maybe = mapper.convertValue(defsObj, new TypeReference<Map<String, Object>>() {});
            if (maybe != null && !maybe.isEmpty()) return Collections.singletonList(maybe);
        } catch (Exception ex) {
            log.warn("Failed to normalize definitions: {}", ex.getMessage());
        }

        return Collections.emptyList();
    }

    private List<String> pickDefinitionsFromCurated(String pos, int need, String excludeWord) {
        List<Map<String, Object>> pool = poolLoader.getPool();
        if (pool == null || pool.isEmpty()) return Collections.emptyList();
        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> e : pool) {
            String w = (String) e.getOrDefault("word", "");
            if (w.equalsIgnoreCase(excludeWord)) continue;
            List<Map<String, Object>> defs = normalizeDefinitions(e.get("definitions"));
            if (defs == null || defs.isEmpty()) continue;
            if (pos != null) {
                String defPos = (String) defs.get(0).getOrDefault("partOfSpeech", "");
                if (!defPos.equalsIgnoreCase(pos)) continue;
            }
            filtered.add(e);
        }
        Collections.shuffle(filtered);
        List<String> out = new ArrayList<>();
        for (Map<String, Object> e : filtered) {
            List<Map<String, Object>> defs = normalizeDefinitions(e.get("definitions"));
            if (defs != null && !defs.isEmpty()) {
                out.add((String) defs.get(0).get("definition"));
                if (out.size() >= need) break;
            }
        }
        return out;
    }
}
