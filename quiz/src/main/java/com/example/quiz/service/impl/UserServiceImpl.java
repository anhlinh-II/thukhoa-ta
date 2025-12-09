package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.UserMapper;
import com.example.quiz.model.dto.request.ForgotPasswordRequest;
import com.example.quiz.model.dto.request.LoginRequest;
import com.example.quiz.model.dto.request.ResetPasswordRequest;
import com.example.quiz.model.entity.user.UserRequest;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.LeaderboardResponseDto;
import com.example.quiz.model.dto.response.LeaderboardUserDto;
import com.example.quiz.model.dto.response.LoginResponse;
import com.example.quiz.model.entity.user.UserResponse;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.model.entity.user.UserView;
import com.example.quiz.repository.user.UserRepository;
import com.example.quiz.repository.user.UserViewRepository;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

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
    UserQuizMockHisRepository userQuizMockHisRepository;

    public UserServiceImpl(AdvancedFilterService advancedFilterService, UserRepository repository, UserViewRepository viewRepository, UserRepository userRepository, UserMapper userMapper, @Lazy PasswordEncoder passwordEncoder, AuthenticationManagerBuilder authenticationManagerBuilder, SecurityUtils securityUtils, EmailUtil emailUtil, UserQuizMockHisRepository userQuizMockHisRepository) {
        super(advancedFilterService, repository, userMapper, viewRepository);
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.securityUtils = securityUtils;
        this.emailUtil = emailUtil;
        this.userQuizMockHisRepository = userQuizMockHisRepository;
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
        if (user.getOtp().equals(otp) && Duration.between(user.getOtpGeneratedTime(), Instant.now()).getSeconds() < 300) {
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
            userLogin.setAvatarUrl(currentUserDB.getAvatarUrl());
            userLogin.setCurrentStreak(currentUserDB.getCurrentStreak() != null ? currentUserDB.getCurrentStreak() : 0);
            userLogin.setLongestStreak(currentUserDB.getLongestStreak() != null ? currentUserDB.getLongestStreak() : 0);
            userLogin.setRankingPoints(currentUserDB.getRankingPoints() != null ? currentUserDB.getRankingPoints() : 0L);
            userLogin.setTotalQuizzesCompleted(currentUserDB.getTotalQuizzesCompleted() != null ? currentUserDB.getTotalQuizzesCompleted() : 0);

            Integer totalStudyTime = userQuizMockHisRepository.getTotalStudyTimeByUserId(currentUserDB.getId());
            Double averageScore = userQuizMockHisRepository.getAverageScoreByUserId(currentUserDB.getId());
            
            userLogin.setTotalStudyTimeMinutes(totalStudyTime != null ? totalStudyTime : 0);
            userLogin.setAverageScore(averageScore != null ? Math.round(averageScore * 100.0) / 100.0 : 0.0);
            userLogin.setAuthorities(currentUserDB.getAuthorities());

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

    @Override
    public void updateStreak(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate() != null 
                ? user.getLastActivityDate().atZone(ZoneId.systemDefault()).toLocalDate() 
                : null;
        
        if (lastActivity == null) {
            user.setCurrentStreak(1);
            user.setLongestStreak(1);
        } else if (lastActivity.equals(today)) {
            return;
        } else if (lastActivity.plusDays(1).equals(today)) {
            int newStreak = (user.getCurrentStreak() != null ? user.getCurrentStreak() : 0) + 1;
            user.setCurrentStreak(newStreak);
            if (newStreak > (user.getLongestStreak() != null ? user.getLongestStreak() : 0)) {
                user.setLongestStreak(newStreak);
            }
        } else {
            user.setCurrentStreak(1);
        }
        
        user.setLastActivityDate(Instant.now());
        userRepository.save(user);
    }

    @Override
    public void updateRankingPoints(Long userId, int correctCount, int totalQuestions) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        if (totalQuestions == 0) return;
        
        double accuracy = (double) correctCount / totalQuestions;
        
        int basePoints = (int) (accuracy * 100);
        
        int currentStreak = user.getCurrentStreak() != null ? user.getCurrentStreak() : 0;
        double streakMultiplier = 1.0 + Math.min(currentStreak * 0.02, 0.5);
        
        int earnedPoints = (int) Math.round(basePoints * streakMultiplier);
        
        long currentRankingPoints = user.getRankingPoints() != null ? user.getRankingPoints() : 0L;
        user.setRankingPoints(currentRankingPoints + earnedPoints);
        
        int totalQuizzes = user.getTotalQuizzesCompleted() != null ? user.getTotalQuizzesCompleted() : 0;
        user.setTotalQuizzesCompleted(totalQuizzes + 1);
        
        userRepository.save(user);
        
        log.info("User {} earned {} ranking points (accuracy: {}%, streak: {}, multiplier: {}x)", 
                userId, earnedPoints, Math.round(accuracy * 100), currentStreak, streakMultiplier);
    }

    @Override
    public LeaderboardResponseDto getLeaderboard(int page, int size) {
        Page<User> leaderboardPage = userRepository.findLeaderboard(PageRequest.of(page, size));
        
        List<LeaderboardUserDto> users = new ArrayList<>();
        int rank = page * size + 1;
        
        for (User user : leaderboardPage.getContent()) {
            Double avgAccuracy = userQuizMockHisRepository.getAverageScoreByUserId(user.getId());
            
            LeaderboardUserDto dto = LeaderboardUserDto.builder()
                    .rank(rank++)
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName() != null ? user.getFullName() : 
                              (user.getFirstName() != null ? user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "") : user.getUsername()))
                    .avatarUrl(user.getAvatarUrl())
                    .rankingPoints(user.getRankingPoints() != null ? user.getRankingPoints() : 0L)
                    .totalQuizzesCompleted(user.getTotalQuizzesCompleted() != null ? user.getTotalQuizzesCompleted() : 0)
                    .currentStreak(user.getCurrentStreak() != null ? user.getCurrentStreak() : 0)
                    .averageAccuracy(avgAccuracy != null ? Math.round(avgAccuracy * 10.0) / 10.0 : 0.0)
                    .build();
            
            users.add(dto);
        }
        
        String currentLogin = SecurityUtils.getCurrentUserLogin().orElse(null);
        LeaderboardUserDto currentUserDto = null;
        Integer currentUserRank = null;
        
        if (currentLogin != null) {
            try {
                User currentUser = handleGetUserByUsernameOrEmailOrPhone(currentLogin);
                Long higherCount = userRepository.countUsersWithHigherRankingPoints(
                        currentUser.getRankingPoints() != null ? currentUser.getRankingPoints() : 0L);
                currentUserRank = higherCount.intValue() + 1;
                
                Double avgAccuracy = userQuizMockHisRepository.getAverageScoreByUserId(currentUser.getId());
                
                currentUserDto = LeaderboardUserDto.builder()
                        .rank(currentUserRank)
                        .id(currentUser.getId())
                        .username(currentUser.getUsername())
                        .fullName(currentUser.getFullName() != null ? currentUser.getFullName() :
                                  (currentUser.getFirstName() != null ? currentUser.getFirstName() + " " + (currentUser.getLastName() != null ? currentUser.getLastName() : "") : currentUser.getUsername()))
                        .avatarUrl(currentUser.getAvatarUrl())
                        .rankingPoints(currentUser.getRankingPoints() != null ? currentUser.getRankingPoints() : 0L)
                        .totalQuizzesCompleted(currentUser.getTotalQuizzesCompleted() != null ? currentUser.getTotalQuizzesCompleted() : 0)
                        .currentStreak(currentUser.getCurrentStreak() != null ? currentUser.getCurrentStreak() : 0)
                        .averageAccuracy(avgAccuracy != null ? Math.round(avgAccuracy * 10.0) / 10.0 : 0.0)
                        .build();
            } catch (Exception e) {
                log.warn("Could not get current user for leaderboard: {}", e.getMessage());
            }
        }
        
        return LeaderboardResponseDto.builder()
                .users(users)
                .totalUsers(leaderboardPage.getTotalElements())
                .currentUserRank(currentUserRank)
                .currentUser(currentUserDto)
                .build();
    }
}
