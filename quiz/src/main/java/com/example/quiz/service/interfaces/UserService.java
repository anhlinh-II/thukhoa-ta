package com.example.quiz.service.interfaces;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.ForgotPasswordRequest;
import com.example.quiz.model.dto.request.LoginRequest;
import com.example.quiz.model.dto.request.ResetPasswordRequest;
import com.example.quiz.model.entity.user.UserRequest;
import com.example.quiz.model.entity.user.UserResponse;
import com.example.quiz.model.dto.response.LoginResponse;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.model.entity.user.UserView;

public interface UserService extends BaseService<User, Long, UserRequest, UserResponse, UserView> {

    User handleGetUserByUsernameOrEmailOrPhone(String loginInput);

    void updateUserToken(String token, String emailUsernamePhone);

    User getUserByRefreshTokenAndEmailOrUsernameOrPhone(String token, String emailUsernamePhone);

    User getUserByEmail(String email);

    boolean verifyOtp(User user, String otp);

    ApiResponse<LoginResponse> login(LoginRequest loginRequest);

    ApiResponse<LoginResponse.UserGetAccount> getAccount(String login);

    ApiResponse<LoginResponse> getRefreshToken(String refreshToken, String message);

    ApiResponse<Void> logout(String emailUsernamePhone);

    ApiResponse<UserResponse> register(UserRequest reqUser);

    ApiResponse<Void> verifyOtp(String email, String otp);

    ApiResponse<String> regenerateOtp(String email);
    
    ApiResponse<String> forgotPassword(ForgotPasswordRequest request);
    
    ApiResponse<Void> resetPassword(ResetPasswordRequest request);

}
