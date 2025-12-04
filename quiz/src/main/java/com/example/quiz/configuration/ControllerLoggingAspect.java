package com.example.quiz.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@Aspect
@Component
public class ControllerLoggingAspect {

     @Autowired
     private ObjectMapper objectMapper;

     // ANSI Color codes
     private static final String RESET = "\u001B[0m";
     private static final String GREEN = "\u001B[32m";
     private static final String BLUE = "\u001B[34m";
     private static final String YELLOW = "\u001B[33m";
     private static final String RED = "\u001B[31m";
     private static final String PURPLE = "\u001B[35m";
     private static final String CYAN = "\u001B[36m";
     private static final String BOLD = "\u001B[1m";

     @Around("execution(* com.example.quiz.controller..*(..)) && !execution(* com.example.quiz.controller.BattleWebSocketController.*(..))")
     public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {

          // Get request details
          ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
          HttpServletRequest request = attributes != null ? attributes.getRequest() : null;
          
          // Skip logging for WebSocket messages (no HTTP request context)
          if (request == null) {
               return joinPoint.proceed();
          }

          String className = joinPoint.getTarget().getClass().getSimpleName();
          String methodName = joinPoint.getSignature().getName();
          Object[] args = joinPoint.getArgs();
          log.info("🚀 API START: {} {} - Request from: {}----------------------------------------------------START--------------------------------------------------------------",
                    request.getMethod(), request.getRequestURI(), request.getRemoteAddr());

          // Log method start with colors
          log.info("{}{}📝 CONTROLLER START:{} {}{}.{}{} - Args: {}{}{}",
                    BOLD, BLUE, RESET, CYAN, className, methodName, RESET, YELLOW, formatArgs(args), RESET);

          if (request != null) {
               log.info("{}{}📝 REQUEST DETAILS:{} {}{} {}{} - Headers: {}{}{}",
                         BOLD, PURPLE, RESET, GREEN, request.getMethod(), request.getRequestURI(), RESET,
                         CYAN, getImportantHeaders(request), RESET);
          }

          long startTime = System.currentTimeMillis();

          try {
               // Execute the method
               Object result = joinPoint.proceed();

               long duration = System.currentTimeMillis() - startTime;

               // Log method end with result
               log.info("{}{}✅ CONTROLLER END:{} {}{}.{}{} - Duration: {}{}ms{} - Result: {}{}{}",
                         BOLD, GREEN, RESET, CYAN, className, methodName, RESET,
                         YELLOW, duration, RESET, PURPLE,
                         result != null ? result.getClass().getSimpleName() : "null", RESET);

               // Log API end
               log.info("✅ API END: {} {} - Status: {} - Duration: {}ms ---------------------------------------------------------------END----------------------------------------------------------------",
                         request.getMethod(), request.getRequestURI(), 200, duration);

               return result;

          } catch (Exception e) {
               long duration = System.currentTimeMillis() - startTime;

               // Log method error
               log.error("{}{}❌ CONTROLLER ERROR:{} {}{}.{}{} - Duration: {}{}ms{} - Error: {}{}{} - Message: {}{}{} ------------------------------ERROR----------------------------------------------------------------",
                         BOLD, RED, RESET, CYAN, className, methodName, RESET,
                         YELLOW, duration, RESET, RED, e.getClass().getSimpleName(), RESET,
                         PURPLE, e.getMessage(), RESET);

               throw e;
          }
     }

     private String formatArgs(Object[] args) {
          if (args == null || args.length == 0) {
               return "[]";
          }

          StringBuilder sb = new StringBuilder("[");
          for (int i = 0; i < args.length; i++) {
               if (i > 0)
                    sb.append(", ");

               Object arg = args[i];
               if (arg == null) {
                    sb.append("null");
               } else if (arg instanceof String || arg instanceof Number || arg instanceof Boolean) {
                    sb.append(arg);
               } else {
                    sb.append(arg.getClass().getSimpleName());
               }
          }
          sb.append("]");
          return sb.toString();
     }

     private String getImportantHeaders(HttpServletRequest request) {
          StringBuilder headers = new StringBuilder();
          headers.append("Content-Type: ").append(request.getContentType()).append(", ");
          headers.append("User-Agent: ").append(request.getHeader("User-Agent")).append(", ");
          headers.append("Origin: ").append(request.getHeader("Origin"));
          return headers.toString();
     }
}
