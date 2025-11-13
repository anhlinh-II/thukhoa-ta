package com.example.quiz.service.user_quiz_history;

import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.mapper.UserQuizMockHisMapper;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisRequestDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisResponseDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisView;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserQuizMockHisServiceImpl2 extends BaseServiceImpl<UserQuizMockHis, Long, UserQuizMockHisRequestDto, UserQuizMockHisResponseDto, UserQuizMockHisView> implements UserQuizMockHisBaseService {
    private final com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisViewRepository viewRepo;

    public UserQuizMockHisServiceImpl2(AdvancedFilterService advancedFilterService, UserQuizMockHisRepository repository, UserQuizMockHisMapper mapper, com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisViewRepository viewRepository) {
        super(advancedFilterService, repository, mapper, viewRepository);
        this.viewRepo = viewRepository;
    }

    @Override
    protected Class<UserQuizMockHisView> getViewClass() {
        return UserQuizMockHisView.class;
    }

}
