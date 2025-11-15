package com.example.quiz.validators.requirePermission;

import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.service.interfaces.AuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import com.example.quiz.configuration.security.SecurityConfig;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class ResourcePermissionAspect {

    private final AuthorizationService authorizationService;

    @Around("@annotation(com.example.quiz.validators.requirePermission.RequirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // If current request path is whitelisted in SecurityConfig, skip permission checking
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String uri = request.getRequestURI();
                for (String p : SecurityConfig.WHITE_LIST) {
                    if (p != null && !p.isEmpty() && uri.startsWith(p)) {
                        log.debug("Skipping permission check for whitelisted path: {}", uri);
                        return joinPoint.proceed();
                    }
                }
            }
        } catch (Exception e) {
            // ignore any errors when trying to read request — fall back to normal permission checks
            log.debug("Could not determine request path for whitelist check", e);
        }
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        RequirePermission requirePermission = method.getAnnotation(RequirePermission.class);
        String resource = requirePermission.resource();
        String action = requirePermission.action();
        
        // Nếu resource empty, lấy từ class-level annotation
        if (resource.isEmpty()) {
            Class<?> controllerClass = joinPoint.getTarget().getClass();
            ResourceController resourceController = controllerClass.getAnnotation(ResourceController.class);
            if (resourceController != null) {
                resource = resourceController.value();
                log.debug("Auto-filled resource from @ResourceController: {}", resource);
            }
        }
        
        log.debug("Checking permission - Resource: {}, Action: {}", resource, action);
        
        // Check permission using AuthorizationService
        if (!authorizationService.hasPermission(resource, action)) {
            log.warn("Access denied for resource: {}, action: {}", resource, action);
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        log.debug("Permission granted for resource: {}, action: {}", resource, action);
        
        // Nếu có permission, tiếp tục execute method
        return joinPoint.proceed();
    }
}
