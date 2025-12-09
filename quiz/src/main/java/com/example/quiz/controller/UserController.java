package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.model.dto.request.ForgotPasswordRequest;
import com.example.quiz.model.dto.request.LoginRequest;
import com.example.quiz.model.dto.request.ResetPasswordRequest;
import com.example.quiz.model.entity.user.UserRequest;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.LeaderboardResponseDto;
import com.example.quiz.model.dto.response.LoginResponse;
import com.example.quiz.model.entity.user.UserResponse;
import com.example.quiz.model.entity.user.User;
import com.example.quiz.model.entity.user.UserView;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.utils.SecurityUtils;
import com.example.quiz.validators.requirePermission.ResourceController;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/v1/users")
@ResourceController("USER")
public class UserController extends BaseController<User, Long, UserRequest, UserResponse, UserView, UserService> {

    private final SecurityUtils securityUtils;
        @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}")
        private String googleClientId;

        @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.redirect-uri:http://localhost:8080/login/oauth2/code/google}")
        private String googleRedirectUri;

        @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}")
        private String authorizedRedirectUri;

    @PostConstruct
    public void logOAuth2Configuration() {
        log.info("=================================================");
        log.info("OAuth2 Configuration:");
        log.info("GOOGLE_REDIRECT_URI: {}", googleRedirectUri);
        log.info("OAUTH2_AUTHORIZED_REDIRECT_URI: {}", authorizedRedirectUri);
        log.info("=================================================");
    }

    public UserController(
            UserService service,
            SecurityUtils securityUtils) {
        super(service);
        this.securityUtils = securityUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        ApiResponse<LoginResponse> apiResponse = service.login(loginRequest);

        // Get refresh token for cookie
        String refresh_token = securityUtils.createRefreshToken(loginRequest.getUsername(),
                apiResponse.getResult());

        // Set refresh token as an HTTP-only cookie
        ResponseCookie resCookie = ResponseCookie.from("refresh_token", refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(securityUtils.refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookie.toString())
                .body(apiResponse);
    }

    @GetMapping("/account")
    public ApiResponse<LoginResponse.UserGetAccount> getAccount() {
        String login = SecurityUtils.getCurrentUserLogin().isPresent()
                ? SecurityUtils.getCurrentUserLogin().get()
                : "";

        return service.getAccount(login);
    }

    @GetMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> getRefreshToken(
            @CookieValue(name = "refresh_token", defaultValue = "blabla") String refresh_token,
            String message) {

        ApiResponse<LoginResponse> apiResponse = service.getRefreshToken(refresh_token, message);

        // Get new refresh token for cookie
        String new_refresh_token = securityUtils.createRefreshToken(
                apiResponse.getResult().getUser().getUsername(),
                apiResponse.getResult());

        // set cookies
        ResponseCookie resCookie = ResponseCookie
                .from("refresh_token", new_refresh_token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(securityUtils.refreshTokenExpiration)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, resCookie.toString())
                .body(apiResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        String emailUsernamePhone = SecurityUtils.getCurrentUserLogin().isPresent()
                ? SecurityUtils.getCurrentUserLogin().get()
                : "";

        ApiResponse<Void> apiResponse = service.logout(emailUsernamePhone);

        // remove fresh token from cookie`
        ResponseCookie deleteSpringCookie = ResponseCookie
                .from("refresh_token", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, deleteSpringCookie.toString())
                .body(apiResponse);
    }

    @PostMapping("/register")
    @RequirePermission(resource = "USER", action = "CREATE")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest reqUser) {
        return service.register(reqUser);
    }

    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        return service.verifyOtp(email, otp);
    }

    @PostMapping("/regenerate-otp")
    public ApiResponse<String> regenerateOtp(@RequestParam String email) {
        return service.regenerateOtp(email);
    }

    @GetMapping("/check-email")
    public ApiResponse<Map<String, Object>> checkEmailExists(@RequestParam String email) {
        User user = service.getUserByEmail(email);
        Map<String, Object> result = new HashMap<>();

        if (user != null) {
            result.put("exists", true);
            result.put("isOAuth2User", user.getGoogleId() != null);
            result.put("provider", user.getGoogleId() != null ? "google" : "email");
            result.put("message", user.getGoogleId() != null
                    ? "This email is registered with Google. Please login with Google."
                    : "This email is already registered. Please login.");
        } else {
            result.put("exists", false);
            result.put("message", "Email is available for registration.");
        }

        return ApiResponse.<Map<String, Object>>builder()
                .code(1000)
                .message("Email check completed")
                .result(result)
                .build();
    }

    @GetMapping("/oauth2-url")
    public ApiResponse<Map<String, String>> getOAuth2Url() {
        Map<String, String> result = new HashMap<>();
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/auth?" +
                "client_id=" + googleClientId + "&" +
                "redirect_uri=" + googleRedirectUri + "&" +
                "scope=profile email&" +
                "response_type=code&" +
                "state=test";

        result.put("googleAuthUrl", googleAuthUrl);
        result.put("instruction",
                "Copy this URL to browser, authorize, then copy the 'code' parameter from redirect URL to test OAuth2 callback endpoint");

        return ApiResponse.<Map<String, String>>builder()
                .code(1000)
                .message("OAuth2 URL generated")
                .result(result)
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return service.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return service.resetPassword(request);
    }

    @GetMapping("/leaderboard")
    public ApiResponse<LeaderboardResponseDto> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.<LeaderboardResponseDto>builder()
                .code(1000)
                .message("Leaderboard fetched successfully")
                .result(service.getLeaderboard(page, size))
                .build();
    }
}
