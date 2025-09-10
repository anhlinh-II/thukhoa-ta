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

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Execute before other aspects
public class ResourcePermissionAspect {

    private final AuthorizationService authorizationService;

    @Around("@annotation(com.example.quiz.validators.requirePermission.RequirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
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
