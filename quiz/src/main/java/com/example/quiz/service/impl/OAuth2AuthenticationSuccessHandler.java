package com.example.quiz.service.impl;

import com.example.quiz.model.dto.response.LoginResponse;
import com.example.quiz.model.entity.User;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.utils.SecurityUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final SecurityUtils securityUtils;
    private final ApplicationContext applicationContext;

    @Value("${app.oauth2.authorizedRedirectUri:http://localhost:3000/oauth2/redirect}")
    private String authorizedRedirectUri;

    public OAuth2AuthenticationSuccessHandler(SecurityUtils securityUtils, ApplicationContext applicationContext) {
        this.securityUtils = securityUtils;
        this.applicationContext = applicationContext;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        // Create JWT tokens
        LoginResponse loginResponse = new LoginResponse();
        LoginResponse.UserLogin userLogin = new LoginResponse.UserLogin(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getLocation(),
                user.getBio(),
                user.isActive(),
                user.getAvatarUrl()
        );
        loginResponse.setUser(userLogin);

        String accessToken = securityUtils.createAccessToken(user.getEmail(), loginResponse);
        String refreshToken = securityUtils.createRefreshToken(user.getEmail(), loginResponse);

        // Update refresh token in database
        UserService userService = applicationContext.getBean(UserService.class);
        userService.updateUserToken(refreshToken, user.getEmail());

        // Set refresh token as HTTP-only cookie
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(securityUtils.refreshTokenExpiration)
                .build();

        response.addHeader("Set-Cookie", refreshTokenCookie.toString());

        // Redirect to frontend with access token
        String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                .queryParam("token", URLEncoder.encode(accessToken, StandardCharsets.UTF_8))
                .build().toUriString();

        log.info("Redirecting to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
