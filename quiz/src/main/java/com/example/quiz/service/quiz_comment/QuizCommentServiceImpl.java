package com.example.quiz.service.quiz_comment;

import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.QuizCommentMapper;
import com.example.quiz.model.entity.quiz_comment.QuizComment;
import com.example.quiz.model.entity.quiz_comment.QuizCommentRequestDto;
import com.example.quiz.model.entity.quiz_comment.QuizCommentResponseDto;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.repository.quiz_comment.QuizCommentRepository;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository;
import com.example.quiz.repository.user.UserRepository;
import com.example.quiz.utils.SecurityUtils;
import com.example.quiz.base.impl.AdvancedFilterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class QuizCommentServiceImpl extends BaseServiceImpl<QuizComment, Long, QuizCommentRequestDto, QuizCommentResponseDto, QuizComment> implements QuizCommentService {

    private final QuizCommentRepository quizCommentRepository;
    private final QuizMockTestRepository quizMockTestRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    public QuizCommentServiceImpl(AdvancedFilterService advancedFilterService,
                                  QuizCommentRepository quizCommentRepository,
                                  JpaRepository<QuizComment, Long> quizCommentViewRepository,
                                  QuizCommentMapper mapper,
                                  QuizMockTestRepository quizMockTestRepository,
                                  UserRepository userRepository) {
        super(advancedFilterService, quizCommentRepository, mapper, quizCommentViewRepository);
        this.quizCommentRepository = quizCommentRepository;
        this.quizMockTestRepository = quizMockTestRepository;
        this.userRepository = userRepository;
    }

    @Override
    protected Class<QuizComment> getViewClass() {
        return QuizComment.class;
    }

    @Override
    @Transactional
    public QuizCommentResponseDto create(QuizCommentRequestDto request) {
        validateBeforeCreate(request);
        // lifecycle hook
        beforeCreate(request);
        QuizComment entity = this.mapper.requestToEntity(request);

        // set quiz
        QuizMockTest quiz = quizMockTestRepository.findById(request.getQuizId())
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_MOCK_TEST_NOT_FOUND));
        entity.setQuiz(quiz);

        // set parent if provided
        if (request.getParentId() != null) {
            QuizComment parent = quizCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
            entity.setParent(parent);
        }

        // set user from security context
        Long currentUserId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        entity.setUser(user);

        QuizComment saved = quizCommentRepository.save(entity);
        QuizCommentResponseDto resp = this.mapper.entityToResponse(saved);
        afterCreate(saved, resp, request);
        return resp;
    }

    @Override
    public Page<QuizCommentResponseDto> findByQuizIdPaged(Long quizId, Pageable pageable) {
        Page<QuizComment> page = quizCommentRepository.findByQuizIdAndIsDeletedFalse(quizId, pageable);
        return page.map(this.mapper::entityToResponse);
    }

    @Override
    public Page<QuizCommentResponseDto> findRepliesPaged(Long parentId, Pageable pageable) {
        Page<QuizComment> page = quizCommentRepository.findByParentIdAndIsDeletedFalse(parentId, pageable);
        return page.map(this.mapper::entityToResponse);
    }

    @Override
    public void flag(Long id, String reason) {
        Optional<QuizComment> maybe = quizCommentRepository.findById(id);
        if (maybe.isEmpty()) throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        QuizComment c = maybe.get();
        c.setIsFlagged(true);
        // simple metadata store for reason
        String newMeta = "{\"flagReason\":\"" + (reason == null ? "" : reason.replace("\"","\\\"")) + "\"}";
        c.setMetadata(newMeta);
        quizCommentRepository.save(c);
    }

    @Override
    public void validateBeforeUpdate(Long id, QuizCommentRequestDto request) {
        super.validateBeforeUpdate(id, request);
        Long currentUserId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        QuizComment existing = quizCommentRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        if (!existing.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    @Override
    public void validateBeforeDelete(Long id) {
        super.validateBeforeDelete(id);
        Long currentUserId = SecurityUtils.getCurrentUserId().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        QuizComment existing = quizCommentRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        if (!existing.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }
}
