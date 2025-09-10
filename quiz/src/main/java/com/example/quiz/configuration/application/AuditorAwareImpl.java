package com.example.quiz.configuration.application;

import com.example.quiz.utils.SecurityUtils;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        // Lấy thông tin user hiện tại từ SecurityContext
        Optional<String> currentUser = SecurityUtils.getCurrentUserLogin();
        
        // Nếu không có user đăng nhập, trả về "system"
        return currentUser.isPresent() ? currentUser : Optional.of("system");
    }
}
