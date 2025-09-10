package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.request.UserRequest;
import com.example.quiz.model.dto.response.UserResponse;
import com.example.quiz.model.entity.User;
import com.example.quiz.model.view.UserView;
import com.example.quiz.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseMapstruct<User, UserRequest, UserResponse, UserView> {
}
