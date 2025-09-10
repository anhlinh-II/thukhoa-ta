package com.example.quiz.utils;

import com.example.quiz.model.dto.response.GoogleOAuth2UserInfo;
import com.example.quiz.model.dto.response.OAuth2UserInfo;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return new GoogleOAuth2UserInfo(attributes);
        } else {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED); // Có thể tạo ErrorCode mới cho OAuth2 provider không được hỗ trợ
        }
    }
}
