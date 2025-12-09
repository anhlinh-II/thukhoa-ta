package com.example.quiz.service;

import com.example.quiz.dto.battle.*;
import com.example.quiz.enums.BattleMode;
import com.example.quiz.enums.BattleStatus;
import com.example.quiz.model.BattleParticipant;
import com.example.quiz.model.QuizBattle;
import com.example.quiz.repository.BattleParticipantRepository;
import com.example.quiz.repository.QuizBattleRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BattleService {
    
    private final QuizBattleRepository battleRepository;
    private final BattleParticipantRepository participantRepository;
    private final com.example.quiz.repository.user.UserRepository userRepository;
    private final com.example.quiz.repository.question_option.QuestionOptionRepository questionOptionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.example.quiz.service.quiz_mock_test.QuizMockTestService quizMockTestService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private String generateInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
    
    @Transactional
    public QuizBattle createBattle(CreateBattleRequest request) {
        QuizBattle battle = new QuizBattle();
        battle.setQuizId(request.getQuizId());
        battle.setBattleMode(request.getBattleMode());
        
        // Fetch and set quiz name
        try {
            var quizPreview = quizMockTestService.getQuizPreview(request.getQuizId());
            String quizName = (String) quizPreview.getOrDefault("examName", 
                              quizPreview.getOrDefault("title", "Quiz #" + request.getQuizId()));
            battle.setQuizName(quizName);
        } catch (Exception e) {
            log.warn("Failed to fetch quiz name for quizId: {}", request.getQuizId(), e);
            battle.setQuizName("Quiz #" + request.getQuizId());
        }
        
        // set leader if provided
        if (request.getLeaderId() != null) {
            battle.setLeaderId(request.getLeaderId());
        }
        battle.setStatus(BattleStatus.WAITING);
        battle.setCreatedAt(LocalDateTime.now());
        
        // Generate unique invite code
        String inviteCode;
        do {
            inviteCode = generateInviteCode();
        } while (battleRepository.findByInviteCode(inviteCode).isPresent());
        battle.setInviteCode(inviteCode);
        
        QuizBattle savedBattle = battleRepository.save(battle);
        
        // Automatically add creator as participant
        if (request.getLeaderId() != null) {
            BattleParticipant participant = new BattleParticipant();
            participant.setBattle(savedBattle);
            participant.setUserId(request.getLeaderId());
            participant.setJoinedAt(LocalDateTime.now());
            participantRepository.save(participant);
            
            // Broadcast initial state with creator as participant
            broadcastBattleState(savedBattle.getId());
        }
        
        return savedBattle;
    }

    @Transactional
    public void disbandBattle(Long battleId, Long requestUserId) {
        QuizBattle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));

        if (battle.getLeaderId() == null || !battle.getLeaderId().equals(requestUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // delete battle; cascade will remove participants
        battleRepository.delete(battle);

        // notify subscribers that this battle was cancelled
        try {
            BattleStateDto state = new BattleStateDto();
            state.setBattleId(battleId);
            state.setStatus(BattleStatus.CANCELLED);
            state.setLeaderId(battle.getLeaderId());
            state.setParticipants(new ArrayList<>());
            messagingTemplate.convertAndSend("/topic/battle/" + battleId + "/state", state);
        } catch (Exception e) {
            log.error("Failed to broadcast battle cancellation for battleId=" + battleId, e);
        }
    }
    
    @Transactional
    public BattleParticipantDto joinBattle(JoinBattleRequest request) {
        QuizBattle battle = battleRepository.findByIdWithParticipants(request.getBattleId())
            .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        if (battle.getStatus() != BattleStatus.WAITING) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        // Check if user already joined (handle duplicates safely)
        List<BattleParticipant> existing = participantRepository.findAllByBattleIdAndUserId(request.getBattleId(), request.getUserId());
        if (existing != null && !existing.isEmpty()) {
            throw new AppException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
        
        // Check IP address duplication (anti-cheat)
//        List<BattleParticipant> sameIpParticipants = participantRepository
//                .findByBattleIdAndIpAddress(request.getBattleId(), request.getIpAddress());
//        if (sameIpParticipants.size() >= 2) {
//            throw new AppException(ErrorCode.INVALID_ACTION);
//        }
        
        // Check max participants
        int currentCount = participantRepository.countByBattleId(request.getBattleId());
        int maxParticipants = battle.getBattleMode() == BattleMode.SOLO_1V1 ? 2 : 4;
        if (currentCount >= maxParticipants) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        BattleParticipant participant = new BattleParticipant();
        participant.setBattle(battle);
        participant.setUserId(request.getUserId());
        participant.setTeamId(request.getTeamId());
        participant.setIpAddress(request.getIpAddress());
        participant.setUserAgent(request.getUserAgent());
        participant.setJoinedAt(LocalDateTime.now());
        
        BattleParticipant saved = participantRepository.save(participant);
        
        // Broadcast state update
        broadcastBattleState(battle.getId());
        
        // Check if should auto-start
        checkAndStartBattle(battle.getId());
        
        return toParticipantDto(saved);
    }

    @Transactional
    public BattleParticipantDto joinBattleByCode(String inviteCode, JoinBattleRequest request) {
        QuizBattle battle = battleRepository.findByInviteCodeWithParticipants(inviteCode)
            .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        if (battle.getStatus() != BattleStatus.WAITING) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        // Set battleId from found battle
        request.setBattleId(battle.getId());
        
        // Reuse existing joinBattle logic
        return joinBattle(request);
    }

    @Transactional
    public void removeParticipant(Long battleId, Long userId) {
        List<BattleParticipant> participants = participantRepository.findAllByBattleIdAndUserId(battleId, userId);
        
        if (participants == null || participants.isEmpty()) {
            return; // Already removed or never joined
        }
        
        // Remove all matching participants (handle duplicates)
        participantRepository.deleteAll(participants);
        
        // Broadcast updated state
        broadcastBattleState(battleId);
    }
    
    @Transactional
    public void setReady(Long battleId, Long userId, boolean ready) {
        log.info("⚙️ setReady called: battleId={}, userId={}, ready={}", battleId, userId, ready);
        
        List<BattleParticipant> matches = participantRepository.findAllByBattleIdAndUserId(battleId, userId);
        BattleParticipant participant = null;
        if (matches == null || matches.isEmpty()) {
            log.error("❌ No participant found for battleId={}, userId={}", battleId, userId);
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        } else {
            if (matches.size() > 1) {
                log.warn("⚠️ Multiple participants found for battleId={}, userId={}, using the first", battleId, userId);
            }
            participant = matches.get(0);
        }
        
        log.info("📝 Setting participant {} ready status to: {}", participant.getId(), ready);
        participant.setIsReady(ready);
        participantRepository.save(participant);
        
        log.info("📡 Broadcasting battle state for battleId={}", battleId);
        broadcastBattleState(battleId);
        
        log.info("🔍 Checking if battle should auto-start");
        checkAndStartBattle(battleId);
        
        log.info("✅ setReady completed successfully for battleId={}, userId={}", battleId, userId);
    }
    
    @Transactional
    public void submitAnswer(SubmitAnswerRequest request) {
        List<BattleParticipant> matches = participantRepository.findAllByBattleIdAndUserId(request.getBattleId(), request.getUserId());
        BattleParticipant participant = null;
        if (matches == null || matches.isEmpty()) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        } else {
            if (matches.size() > 1) {
                log.warn("Warning: multiple participants found for battleId={}, userId={}, using the first", request.getBattleId(), request.getUserId());
            }
            participant = matches.get(0);
        }
        
        // Parse existing answers
        List<Map<String, Object>> answers = parseAnswers(participant.getAnswers());
        
        // Check if answer is correct and calculate score
        boolean isCorrect = false;
        int scoreToAdd = 0;
        try {
            Long optionId = Long.parseLong(request.getAnswer());
            var optionOpt = questionOptionRepository.findById(optionId);
            if (optionOpt.isPresent()) {
                var option = optionOpt.get();
                isCorrect = Boolean.TRUE.equals(option.getIsCorrect());
                if (isCorrect) {
                    scoreToAdd = 10;
                    long timeTaken = request.getTimeTaken() != null ? request.getTimeTaken() : 60000;
                    if (timeTaken < 5000) scoreToAdd += 5;
                    else if (timeTaken < 10000) scoreToAdd += 3;
                    else if (timeTaken < 20000) scoreToAdd += 1;
                    
                    participant.setScore(participant.getScore() + scoreToAdd);
                }
            }
        } catch (NumberFormatException e) {
            log.warn("Could not parse answer as option ID: {}", request.getAnswer());
        }
        
        // Add new answer with result
        Map<String, Object> newAnswer = new java.util.HashMap<>();
        newAnswer.put("questionId", request.getQuestionId());
        newAnswer.put("answer", request.getAnswer());
        newAnswer.put("timestamp", request.getTimestamp());
        newAnswer.put("timeTaken", request.getTimeTaken());
        newAnswer.put("isCorrect", isCorrect);
        newAnswer.put("scoreAdded", scoreToAdd);
        answers.add(newAnswer);
        
        // Save updated answers
        try {
            participant.setAnswers(objectMapper.writeValueAsString(answers));
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        
        // Check for cheating patterns
        detectCheating(participant, answers);
        
        participantRepository.save(participant);
        
        log.info("Answer submitted: battleId={}, userId={}, questionId={}, isCorrect={}, scoreAdded={}, totalScore={}", 
            request.getBattleId(), request.getUserId(), request.getQuestionId(), isCorrect, scoreToAdd, participant.getScore());
        
        // Broadcast leaderboard update
        broadcastLeaderboard(request.getBattleId());
    }
    
    @Transactional
    public void reportTabSwitch(Long battleId, Long userId) {
        List<BattleParticipant> matches = participantRepository.findAllByBattleIdAndUserId(battleId, userId);
        BattleParticipant participant = null;
        if (matches == null || matches.isEmpty()) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        } else {
            if (matches.size() > 1) {
                System.out.println("Warning: multiple participants found for battleId=" + battleId + ", userId=" + userId + ", using the first");
            }
            participant = matches.get(0);
        }
        
        participant.setTabSwitchCount(participant.getTabSwitchCount() + 1);
        
        if (participant.getTabSwitchCount() > 5) {
            addSuspiciousFlag(participant, "Excessive tab switching: " + participant.getTabSwitchCount());
        }
        
        participantRepository.save(participant);
    }
    
    @Transactional
    public void completeBattle(Long battleId, Long userId) {
        List<BattleParticipant> matches = participantRepository.findAllByBattleIdAndUserId(battleId, userId);
        BattleParticipant participant = null;
        if (matches == null || matches.isEmpty()) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        } else {
            if (matches.size() > 1) {
                System.out.println("Warning: multiple participants found for battleId=" + battleId + ", userId=" + userId + ", using the first");
            }
            participant = matches.get(0);
        }
        
        participant.setCompletedAt(LocalDateTime.now());
        participantRepository.save(participant);
        
        broadcastLeaderboard(battleId);
        
        // Check if all completed
        List<BattleParticipant> allParticipants = participantRepository.findByBattleId(battleId);
        boolean allCompleted = allParticipants.stream()
                .allMatch(p -> p.getCompletedAt() != null);
        
        if (allCompleted) {
                QuizBattle battle = battleRepository.findById(battleId)
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
            battle.setStatus(BattleStatus.COMPLETED);
            battle.setEndedAt(LocalDateTime.now());
            battleRepository.save(battle);
            
            broadcastBattleState(battleId);
        }
    }
    
    private void checkAndStartBattle(Long battleId) {
        QuizBattle battle = battleRepository.findByIdWithParticipants(battleId)
            .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
        int maxParticipants = battle.getBattleMode() == BattleMode.SOLO_1V1 ? 2 : 4;
        
        boolean shouldStart = participants.size() == maxParticipants && 
                             participants.stream().allMatch(BattleParticipant::getIsReady);
        
        if (shouldStart && battle.getStatus() == BattleStatus.WAITING) {
            battle.setStatus(BattleStatus.IN_PROGRESS);
            battle.setStartedAt(LocalDateTime.now());
            battleRepository.save(battle);
            
            broadcastBattleState(battleId);
        }
    }
    
    private void detectCheating(BattleParticipant participant, List<Map<String, Object>> answers) {
        // Pattern 1: Too fast answers (< 2 seconds) for multiple questions
        long fastAnswerCount = answers.stream()
                .filter(a -> ((Number) a.get("timeTaken")).intValue() < 2000)
                .count();
        
        if (fastAnswerCount > 3) {
            addSuspiciousFlag(participant, "Too many fast answers: " + fastAnswerCount);
        }
        
        // Pattern 2: Consistent timing (possible bot)
        if (answers.size() >= 5) {
            List<Integer> timings = answers.stream()
                    .map(a -> ((Number) a.get("timeTaken")).intValue())
                    .collect(Collectors.toList());
            
            double variance = calculateVariance(timings);
            if (variance < 500) {
                addSuspiciousFlag(participant, "Suspiciously consistent timing, variance: " + variance);
            }
        }
    }
    
    private void addSuspiciousFlag(BattleParticipant participant, String flag) {
        List<String> flags = parseSuspiciousFlags(participant.getSuspiciousFlags());
        flags.add(flag);
        
        try {
            participant.setSuspiciousFlags(objectMapper.writeValueAsString(flags));
        } catch (Exception e) {
            // ignore
        }
    }
    
    private List<Map<String, Object>> parseAnswers(String answersJson) {
        if (answersJson == null || answersJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(answersJson, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private List<String> parseSuspiciousFlags(String flagsJson) {
        if (flagsJson == null || flagsJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(flagsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private double calculateVariance(List<Integer> values) {
        double mean = values.stream().mapToInt(Integer::intValue).average().orElse(0);
        double variance = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0);
        return variance;
    }
    
    public void broadcastBattleState(Long battleId) {
        QuizBattle battle = battleRepository.findByIdWithParticipants(battleId)
            .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
        
        List<BattleParticipantDto> participantDtos = participants.stream()
                .map(this::toParticipantDto)
                .collect(Collectors.toList());
        
        BattleStateDto state = new BattleStateDto(); 
        state.setBattleId(battleId);
        state.setStatus(battle.getStatus());
        state.setStartedAt(battle.getStartedAt());
        state.setLeaderId(battle.getLeaderId());
        state.setParticipants(participantDtos);
        
        messagingTemplate.convertAndSend("/topic/battle/" + battleId + "/state", state);
    }
    
    public void broadcastLeaderboard(Long battleId) {
        List<BattleParticipant> leaderboard = participantRepository.findLeaderboard(battleId);
        
        List<BattleParticipantDto> leaderboardDtos = leaderboard.stream()
                .map(this::toParticipantDto)
                .collect(Collectors.toList());
        
        messagingTemplate.convertAndSend("/topic/battle/" + battleId + "/leaderboard", leaderboardDtos);
    }

    public void broadcastEmote(Long battleId, com.example.quiz.dto.battle.EmoteDto emote) {
        try {
            messagingTemplate.convertAndSend("/topic/battle/" + battleId + "/emote", emote);
        } catch (Exception e) {
            log.error("Failed to broadcast emote for battleId={}", battleId, e);
        }
    }
    
    private BattleParticipantDto toParticipantDto(BattleParticipant p) {
        BattleParticipantDto dto = new BattleParticipantDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUserId());
        // populate username and avatar if available
        try {
            userRepository.findById(p.getUserId()).ifPresent(u -> {
                dto.setUserName(u.getUsername());
                dto.setAvatarUrl(u.getAvatarUrl());
            });
        } catch (Exception e) {
            // ignore lookup errors
        }
        dto.setTeamId(p.getTeamId());
        dto.setScore(p.getScore());
        dto.setIsReady(p.getIsReady());
        dto.setIsCompleted(p.getCompletedAt() != null);
        dto.setTabSwitchCount(p.getTabSwitchCount());
        dto.setIsSuspicious(p.getSuspiciousFlags() != null && !p.getSuspiciousFlags().isEmpty());
        dto.setBattleId(p.getBattle() != null ? p.getBattle().getId() : null);
        return dto;
    }
    
    public List<QuizBattle> getWaitingBattles(Long quizId) {
        return battleRepository.findByQuizIdAndStatus(quizId, BattleStatus.WAITING);
    }
    
    public QuizBattle getBattle(Long battleId) {
        return battleRepository.findByIdWithParticipants(battleId)
            .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
    }
    
    public BattleResultDto getBattleResults(Long battleId) {
        QuizBattle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));

        List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);

        // Map to DTOs for participants sorted by score desc
        List<BattleParticipantDto> participantDtos = participants.stream()
                .map(this::toParticipantDto)
                .sorted((a, b) -> Integer.compare(b.getScore() != null ? b.getScore() : 0, a.getScore() != null ? a.getScore() : 0))
                .collect(Collectors.toList());

        List<TeamResultDto> teamResults = new java.util.ArrayList<>();

        // If battle is team mode, aggregate by teamId
        if (battle.getBattleMode() != null && battle.getBattleMode().name().startsWith("TEAM")) {
            Map<Integer, List<BattleParticipantDto>> grouped = participantDtos.stream()
                    .filter(p -> p.getTeamId() != null)
                    .collect(Collectors.groupingBy(BattleParticipantDto::getTeamId));

            for (Map.Entry<Integer, List<BattleParticipantDto>> e : grouped.entrySet()) {
                Integer teamId = e.getKey();
                List<BattleParticipantDto> members = e.getValue();
                int total = members.stream().mapToInt(m -> m.getScore() != null ? m.getScore() : 0).sum();
                teamResults.add(new TeamResultDto(teamId, total, members));
            }

            // sort teams by total score desc
            teamResults.sort((t1, t2) -> Integer.compare(t2.getTotalScore() != null ? t2.getTotalScore() : 0,
                    t1.getTotalScore() != null ? t1.getTotalScore() : 0));
        }

        BattleResultDto result = new BattleResultDto();
        result.setParticipants(participantDtos);
        result.setTeams(teamResults);
        return result;
    }
    
    public List<BattleParticipantDto> getParticipants(Long battleId) {
        List<BattleParticipant> participants = participantRepository.findByBattleId(battleId);
        return participants.stream()
                .map(this::toParticipantDto)
                .collect(Collectors.toList());
    }
}
