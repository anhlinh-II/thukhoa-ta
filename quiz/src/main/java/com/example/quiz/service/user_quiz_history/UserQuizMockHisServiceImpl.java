package com.example.quiz.service.user_quiz_history;

import com.example.quiz.model.dto.response.UserQuizHisResponse;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserQuizMockHisServiceImpl implements UserQuizMockHisService {

    private final UserQuizMockHisRepository userQuizMockHisRepository;
    private final UserService userService;

    public UserQuizMockHisServiceImpl(UserQuizMockHisRepository userQuizMockHisRepository, UserService userService) {
        this.userQuizMockHisRepository = userQuizMockHisRepository;
        this.userService = userService;
    }

    @Override
    public Page<UserQuizHisResponse> getMyHistory(int page, int size) {
        String username = SecurityUtils.getCurrentUserLogin().orElse(null);
        if (username == null) return Page.empty();

        com.example.quiz.model.entity.user.User user = userService.handleGetUserByUsernameOrEmailOrPhone(username);
        if (user == null) return Page.empty();

        PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<UserQuizMockHis> p = userQuizMockHisRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId(), pr);

        List<UserQuizHisResponse> items = p.stream().map(h -> new UserQuizHisResponse(h.getId(), h.getQuizMockTestId(), h.getScore(), h.getTotalQuestions(), h.getCorrectCount(), h.getCreatedAt())).collect(Collectors.toList());

        return new PageImpl<>(items, pr, p.getTotalElements());
    }
}
