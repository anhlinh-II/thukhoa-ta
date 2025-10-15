package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.user.UserRequest;
import com.example.quiz.model.entity.user.UserResponse;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.model.entity.user.UserView;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper extends BaseMapstruct<User, UserRequest, UserResponse, UserView> {
}
