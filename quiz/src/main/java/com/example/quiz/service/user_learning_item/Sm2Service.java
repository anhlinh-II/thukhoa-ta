package com.example.quiz.service.user_learning_item;

import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import com.example.quiz.repository.user_learning_item.UserLearningItemRepository;
import com.example.quiz.enums.LearningType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class Sm2Service {

    private final UserLearningItemRepository repository;

    public Sm2Service(UserLearningItemRepository repository) {
        this.repository = repository;
    }

    /**
     * Create a new learning item for a wrong question if it doesn't exist.
     * Initializes SM-2 fields with sensible defaults.
     */
    @Transactional
    public UserLearningItem createIfAbsentAndMarkWrong(Long userId, Long questionId, LearningType learningType) {
        Optional<UserLearningItem> opt = repository.findByUserIdAndQuestionIdAndLearningType(userId, questionId, learningType);
        if (opt.isPresent()) {
            UserLearningItem existing = opt.get();
            // mark wrong: increment consecutiveFails and lapses, keep schedule as-is or schedule sooner
            existing.setConsecutiveFails((existing.getConsecutiveFails() == null ? 0 : existing.getConsecutiveFails()) + 1);
            existing.setLapses((existing.getLapses() == null ? 0 : existing.getLapses()) + 1);
            // If it's failed now, ensure next review is scheduled for today (so it appears in today's review list)
            existing.setNextReviewAt(Instant.now());
            existing.setLastReviewedAt(Instant.now());
            return repository.save(existing);
        }

        UserLearningItem item = new UserLearningItem();
        item.setUserId(userId);
        item.setQuestionId(questionId);
        item.setLearningType(learningType);
        // SM-2 recommended initial easiness factor
        item.setEf(2.5);
        // first encounter, no successful repetitions yet
        item.setRepetitions(0);
        // set interval 1 day for next review
        item.setIntervalDays(1);
        item.setNextReviewAt(Instant.now());
        item.setLastReviewedAt(null);
        item.setLapses(1);
        item.setConsecutiveFails(1);
        // priority: smaller interval => higher priority; use inverse of interval (avoid div by zero)
        item.setPriority(1.0 / Math.max(1, item.getIntervalDays()));

        return repository.save(item);
    }

    /**
     * Update an existing learning item after a review using SM-2 algorithm.
     * Quality should be in range 0..5 (5=perfect recall, 0=complete blackout).
     */
    @Transactional
    public UserLearningItem updateOnReview(UserLearningItem item, int quality) {
        if (quality < 0) quality = 0;
        if (quality > 5) quality = 5;

        // update efactor
        double ef = item.getEf() == null ? 2.5 : item.getEf();
        double q = quality;
        double newEf = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (newEf < 1.3) newEf = 1.3;

        if (quality >= 3) {
            // successful recall
            int prevReps = item.getRepetitions() == null ? 0 : item.getRepetitions();
            int newReps = prevReps + 1;

            int newInterval;
            if (prevReps == 0) {
                newInterval = 1;
            } else if (prevReps == 1) {
                newInterval = 6;
            } else {
                int prevInterval = item.getIntervalDays() == null ? 1 : item.getIntervalDays();
                newInterval = (int) Math.round(prevInterval * newEf);
            }

            item.setRepetitions(newReps);
            item.setIntervalDays(newInterval);
            item.setConsecutiveFails(0);
        } else {
            // failed recall
            item.setRepetitions(0);
            item.setIntervalDays(1);
            item.setConsecutiveFails((item.getConsecutiveFails() == null ? 0 : item.getConsecutiveFails()) + 1);
            item.setLapses((item.getLapses() == null ? 0 : item.getLapses()) + 1);
        }

        item.setEf(newEf);
        item.setLastReviewedAt(Instant.now());

        // schedule next review
        int intervalDays = item.getIntervalDays() == null ? 1 : item.getIntervalDays();
        item.setNextReviewAt(Instant.now().plus(intervalDays, ChronoUnit.DAYS));

        // recompute priority (simple): soonest nextReviewAt -> higher priority
        long daysUntil = ChronoUnit.DAYS.between(Instant.now().truncatedTo(ChronoUnit.DAYS), item.getNextReviewAt().truncatedTo(ChronoUnit.DAYS));
        if (daysUntil < 0) daysUntil = 0;
        item.setPriority(1.0 / Math.max(1, daysUntil));

        return repository.save(item);
    }

    /**
     * Get due items for a user at given time (items with nextReviewAt <= time).
     */
    @Transactional(readOnly = true)
    public List<UserLearningItem> getDueItemsForUser(Long userId, LearningType learningType, Instant now) {
        return repository.findAllByUserIdAndLearningTypeAndNextReviewAtBefore(userId, learningType, now);
    }
}
