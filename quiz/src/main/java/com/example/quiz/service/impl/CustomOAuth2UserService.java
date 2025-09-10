package com.example.quiz.service.impl;

import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.model.dto.response.OAuth2UserInfo;
import com.example.quiz.model.entity.User;
import com.example.quiz.repository.UserRepository;
import com.example.quiz.utils.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        if (oAuth2UserInfo.getEmail() == null || oAuth2UserInfo.getEmail().isEmpty()) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED); // Email not found from OAuth2 provider
        }

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerNewUser(oAuth2UserInfo);
        }

        return new CustomOAuth2User(oAuth2User.getAttributes(), user);
    }

    private User registerNewUser(OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();
        
        // Basic info
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setUsername(generateUniqueUsername(oAuth2UserInfo.getEmail()));
        user.setAvatarUrl(oAuth2UserInfo.getImageUrl());
        user.setActive(true); // OAuth2 users are automatically active
        
        // OAuth2 specific info
        user.setGoogleId(oAuth2UserInfo.getId());
        user.setFullName(oAuth2UserInfo.getName());
        user.setFirstName(oAuth2UserInfo.getGivenName());
        user.setLastName(oAuth2UserInfo.getFamilyName());
        user.setLocale(oAuth2UserInfo.getLocale());
        
        // Set dummy password for OAuth2 users
        user.setPassword("OAUTH2_USER"); // This will never be used for login
        
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        // Update avatar and OAuth2 info
        existingUser.setAvatarUrl(oAuth2UserInfo.getImageUrl());
        existingUser.setGoogleId(oAuth2UserInfo.getId());
        existingUser.setFullName(oAuth2UserInfo.getName());
        existingUser.setFirstName(oAuth2UserInfo.getGivenName());
        existingUser.setLastName(oAuth2UserInfo.getFamilyName());
        existingUser.setLocale(oAuth2UserInfo.getLocale());
        
        return userRepository.save(existingUser);
    }
    
    private String generateUniqueUsername(String email) {
        String baseUsername = email.substring(0, email.indexOf('@'));
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}
