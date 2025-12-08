package com.example.quiz.configuration.security;

import com.example.quiz.service.impl.CustomOAuth2UserService;
import com.example.quiz.service.impl.OAuth2AuthenticationFailureHandler;
import com.example.quiz.service.impl.OAuth2AuthenticationSuccessHandler;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true) // Temporarily disabled for testing
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    public static final String[] WHITE_LIST = {
            "/api/users/login", "/api/users/refresh", "/api/users/register", "/api/users/verify-otp", "/api/users/logout", "/ws/**", "/api/v1/users/views/list", 
            "/oauth2/**", "/login/oauth2/**", "/api/users/oauth2-url", "/api/users/forgot-password", "/api/users/reset-password", "/api/v1/programs/tree",
            "/api/v1/users/**",
            "/api/v1/user-vocabulary/**",
            "/api/v1/quiz-comments/**",
            "/api/v1/files/**",
            "/api/v1/quiz-mock-tests/*/preview",
            "/api/v1/flashcard-items/**",
            "/api/v1/flashcard-categories/**"
    };

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final JwtDecoder jwtDecoder;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri:http://localhost:8080/login/oauth2/code/google}")
    private String googleRedirectUri;

    @Value("${app.oauth2.authorizedRedirectUri:http://localhost:3000/oauth2/redirect}")
    private String authorizedRedirectUri;

    @PostConstruct
    public void logOAuth2Configuration() {
        log.info("=================================================");
        log.info("OAuth2 Configuration:");
        log.info("GOOGLE_REDIRECT_URI: {}", googleRedirectUri);
        log.info("OAUTH2_AUTHORIZED_REDIRECT_URI: {}", authorizedRedirectUri);
        log.info("=================================================");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(
                        auth -> auth
                                .requestMatchers(WHITE_LIST).permitAll()
                                .anyRequest().authenticated()
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                )
                .oauth2ResourceServer(
                        (oauth2) -> oauth2
                                .jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder)
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("permission");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public org.springframework.security.authentication.AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(org.springframework.security.authentication.AuthenticationManager.class);
    }
}
