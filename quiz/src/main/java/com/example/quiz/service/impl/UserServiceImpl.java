package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.UserMapper;
import com.example.quiz.model.dto.request.ForgotPasswordRequest;
import com.example.quiz.model.dto.request.LoginRequest;
import com.example.quiz.model.dto.request.ResetPasswordRequest;
import com.example.quiz.model.dto.request.UserRequest;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.LoginResponse;
import com.example.quiz.model.dto.response.UserResponse;
import com.example.quiz.model.entity.User;
import com.example.quiz.model.view.UserView;
import com.example.quiz.repository.UserRepository;
import com.example.quiz.repository.UserViewRepository;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.utils.EmailUtil;
import com.example.quiz.utils.OtpUtil;
import com.example.quiz.utils.SecurityUtils;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl extends BaseServiceImpl<User, Long, UserRequest, UserResponse, UserView>
        implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    AuthenticationManagerBuilder authenticationManagerBuilder;
    SecurityUtils securityUtils;
    EmailUtil emailUtil;

    public UserServiceImpl(AdvancedFilterService advancedFilterService, UserRepository repository, UserViewRepository viewRepository, UserRepository userRepository, UserMapper userMapper, @Lazy PasswordEncoder passwordEncoder, AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtils securityUtils, EmailUtil emailUtil) {
        super(advancedFilterService, repository, userMapper, viewRepository);
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtils = securityUtils;
        this.emailUtil = emailUtil;
    }

    @Override
    protected Class<UserView> getViewClass() {
        return UserView.class;
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
    }

    @Override
    public User handleGetUserByUsernameOrEmailOrPhone(String loginInput) {
        Optional<User> optionalUser = this.userRepository.findByEmail(loginInput);
        log.info("login input: {}", loginInput);
        if (optionalUser.isEmpty()) {
            optionalUser = userRepository.findByUsername(loginInput);
        }
        if (optionalUser.isEmpty()) {
            optionalUser = userRepository.findByPhone(loginInput);
        }
        if (optionalUser.isEmpty()) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }

        return optionalUser.get();
    }

    @Override
    public void updateUserToken(String token, String emailUsernamePhone) {
        User currentUser = this.handleGetUserByUsernameOrEmailOrPhone(emailUsernamePhone);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    @Override
    public User getUserByRefreshTokenAndEmailOrUsernameOrPhone(String token, String emailUsernamePhone) {
        return this.userRepository.findByRefreshTokenAndEmailOrUsernameOrPhone(token, emailUsernamePhone)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
    }

    @Override
    public User getUserByEmail(String email) {
        Optional<User> optionalUser = this.userRepository.findByEmail(email);
        return optionalUser.orElse(null);
    }

    @Override
    public boolean verifyOtp(User user, String otp) {
        if (user.getOtp().equals(otp) && Duration.between(user.getOtpGeneratedTime(), Instant.now()).getSeconds() < 60) {
            user.setOtp(otp);
            userRepository.save(user);
            return true;
        } else if (!user.getOtp().equals(otp)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        } else {
            throw new AppException(ErrorCode.EXPIRED_OTP);
        }
    }

    @Override
    public ApiResponse<LoginResponse> login(LoginRequest loginRequest) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword());

        // Authenticate the user
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        log.info("auth success");
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("authentication principal: {}", authentication.getPrincipal());

        // Prepare the login response
        LoginResponse loginResponse = new LoginResponse();
        User currentUserDB = handleGetUserByUsernameOrEmailOrPhone(loginRequest.getUsername());

        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin(
                currentUserDB.getId(),
                currentUserDB.getEmail(),
                currentUserDB.getUsername(),
                currentUserDB.getLocation(),
                currentUserDB.getBio(),
                currentUserDB.isActive(),
                currentUserDB.getAvatarUrl());
        loginResponse.setUser(userLogin);

        // Generate tokens
        String access_token = securityUtils.createAccessToken(authentication.getName(), loginResponse);
        loginResponse.setAccess_token(access_token);

        String refresh_token = securityUtils.createRefreshToken(loginRequest.getUsername(), loginResponse);

        // Update refresh token for the user in the database
        updateUserToken(refresh_token, loginRequest.getUsername());

        // Create the ApiResponse
        return ApiResponse.<LoginResponse>builder()
                .code(1000)
                .message("Login successfully")
                .result(loginResponse)
                .build();
    }

    @Override
    public ApiResponse<LoginResponse.UserGetAccount> getAccount(String login) {
        User currentUserDB = this.handleGetUserByUsernameOrEmailOrPhone(login);
        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin();
        LoginResponse.UserGetAccount userGetAccount = new LoginResponse.UserGetAccount();
        if (currentUserDB != null) {
            userLogin.setId(currentUserDB.getId());
            userLogin.setEmail(currentUserDB.getEmail());
            userLogin.setUsername(currentUserDB.getUsername());
            userLogin.setLocation(currentUserDB.getLocation());
            userLogin.setBio(currentUserDB.getBio());

            userGetAccount.setUser(userLogin);
        }

        return ApiResponse.<LoginResponse.UserGetAccount>builder()
                .code(1000)
                .message("Get current user successfully!")
                .result(userGetAccount)
                .build();
    }

    @Override
    public ApiResponse<LoginResponse> getRefreshToken(String refreshToken, String message) {
        if (refreshToken.equals("blabla")) {
            throw new AppException(ErrorCode.NO_REFRESH_TOKEN);
        }
        // check valid
        Jwt decodedToken = this.securityUtils.checkValidRefreshToken(refreshToken);
        String emailUsernamePhone = decodedToken.getSubject();

        // check user by token + email
        User currentUser = this.getUserByRefreshTokenAndEmailOrUsernameOrPhone(refreshToken, emailUsernamePhone);

        // issue new token / set refresh token as cookies
        LoginResponse res = new LoginResponse();

        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin(
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getUsername(),
                currentUser.getLocation(),
                currentUser.getBio(),
                currentUser.isActive(),
                currentUser.getAvatarUrl());
        res.setUser(userLogin);

        String access_token = this.securityUtils.createAccessToken(emailUsernamePhone, res);
        res.setAccess_token(access_token);

        // create refresh token
        String new_refresh_token = this.securityUtils.createRefreshToken(emailUsernamePhone, res);

        // update refreshToken for user
        this.updateUserToken(new_refresh_token, emailUsernamePhone);

        return ApiResponse.<LoginResponse>builder()
                .code(1000)
                .message(message)
                .result(res)
                .build();
    }

    @Override
    public ApiResponse<Void> logout(String emailUsernamePhone) {
        log.info("emailUsernamePhone >> {}", emailUsernamePhone);

        if (emailUsernamePhone.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_ACCESS_TOKEN);
        }

        // update refresh token = null
        this.updateUserToken(null, emailUsernamePhone);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Log out successfully!")
                .build();
    }

    @Override
    public ApiResponse<UserResponse> register(UserRequest reqUser) {
        // Check if email already exists (including OAuth2 users)
        User existingUser = getUserByEmail(reqUser.getEmail());
        if (existingUser != null) {
            if (existingUser.getGoogleId() != null) {
                // User already exists via Google OAuth2
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS_WITH_GOOGLE);
            } else {
                // User already exists with regular registration
                throw new AppException(ErrorCode.ENTITY_EXISTED);
            }
        }

        this.create(reqUser);

        String otp = OtpUtil.generateOtp(6);

        try {
            emailUtil.sendOtpEmail(reqUser.getEmail(), otp);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.ERROR_EMAIL);
        }

        // Update user with OTP
        User user = getUserByEmail(reqUser.getEmail());
        if (user != null) {
            user.setOtp(otp);
            user.setOtpGeneratedTime(Instant.now());
            userRepository.save(user);
        }

        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("register successfully!")
                .build();
    }

    @Override
    public ApiResponse<Void> verifyOtp(String email, String otp) {
        User user = getUserByEmail(email);

        boolean isVerified = verifyOtp(user, otp);
        if (isVerified) {
            user.setActive(true);
            userRepository.save(user);

            return ApiResponse.<Void>builder()
                    .code(1000)
                    .message("Account verified successfully!")
                    .build();
        } else {
            return ApiResponse.<Void>builder()
                    .code(1001)
                    .message("Invalid or expired OTP.")
                    .build();
        }
    }

    @Override
    public ApiResponse<String> regenerateOtp(String email) {
        User user = getUserByEmail(email);

        String otp = OtpUtil.generateOtp(6);
        try {
            emailUtil.sendOtpEmail(email, otp);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.ERROR_EMAIL);
        }

        user.setOtp(otp);
        user.setOtpGeneratedTime(Instant.now());
        userRepository.save(user);
        
        return ApiResponse.<String>builder()
                .code(1000)
                .message("New OTP sent to email.")
                .result("OTP regenerated")
                .build();
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        User user = getUserByEmail(request.getEmail());
        
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        if (user.getGoogleId() != null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(Instant.now().plus(Duration.ofMinutes(15))); // 15 minutes expiry
        userRepository.save(user);

        // Send reset email
        try {
            String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
            emailUtil.sendResetPasswordEmail(user.getEmail(), resetUrl);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.ERROR_EMAIL);
        }

        return ApiResponse.<String>builder()
                .code(1000)
                .message("Reset password link sent to your email")
                .result("Check your email for reset password link")
                .build();
    }

    @Override
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        Optional<User> userOpt = userRepository.findByResetPasswordToken(request.getToken());
        if (userOpt.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        User user = userOpt.get();
        
        // Check if token is expired
        if (user.getResetPasswordTokenExpiry().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Password reset successfully")
                .build();
    }

    @Override
    public UserResponse create(UserRequest request) {
        request.setPassword(passwordEncoder.encode(request.getPassword()));
        return super.create(request);
    }
}
