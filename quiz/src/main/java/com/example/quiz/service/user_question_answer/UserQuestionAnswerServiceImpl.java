package com.example.quiz.service.user_question_answer;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.UserQuestionAnswerMapper;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerRequest;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerResponse;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerRepository;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerViewRepository;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.utils.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
public class UserQuestionAnswerServiceImpl extends BaseServiceImpl<UserQuestionAnswer, Long, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView> implements UserQuestionAnswerService {
    private final UserQuestionAnswerRepository questionRepository;
    private final UserQuestionAnswerViewRepository questionViewRepository;
    private final UserService userService;

    public UserQuestionAnswerServiceImpl(
            AdvancedFilterService advancedFilterService,
            UserQuestionAnswerRepository questionRepository,
            UserQuestionAnswerMapper questionMapper,
            UserQuestionAnswerViewRepository questionViewRepository,
            UserService userService) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
        this.userService = userService;
    }
    
    @Override
    public void beforeCreate(UserQuestionAnswerRequest request) {
        if (request != null && request.getUserId() == null) {
            try {
                String username = SecurityUtils.getCurrentUserLogin().orElse(null);
                if (username != null) {
                    User u = userService.handleGetUserByUsernameOrEmailOrPhone(username);
                    if (u != null) {
                        request.setUserId(u.getId());
                    }
                }
            } catch (Exception ex) {
                // ignore - creation will still proceed and may fail schema constraints
            }
        }
    }
    @Override
    protected Class<UserQuestionAnswerView> getViewClass() {
        return UserQuestionAnswerView.class;
    }

}


/*

package com.example.quiz.service.user_question_answer;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.UserQuestionAnswerMapper;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerRequest;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerResponse;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerRepository;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerViewRepository;
import org.springframework.stereotype.Service;

@Service
public class UserQuestionAnswerServiceImpl extends BaseServiceImpl<UserQuestionAnswer, Long, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView> implements UserQuestionAnswerService {
    private final UserQuestionAnswerRepository questionRepository;
    private final UserQuestionAnswerViewRepository questionViewRepository;

    public UserQuestionAnswerServiceImpl(
            AdvancedFilterService advancedFilterService,
            UserQuestionAnswerRepository questionRepository,
            UserQuestionAnswerMapper questionMapper,
            UserQuestionAnswerViewRepository questionViewRepository) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
    }

    @Override
    protected Class<UserQuestionAnswerView> getViewClass() {
        return UserQuestionAnswerView.class;
    }
}

 */