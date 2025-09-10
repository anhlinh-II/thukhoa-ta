package com.example.quiz.configuration.aop;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * Configuration để enable AOP cho ResourcePermissionAspect
 */
@Configuration
@EnableAspectJAutoProxy
public class AspectConfig {
    // Configuration này enable AOP auto-proxy để ResourcePermissionAspect hoạt động
}
