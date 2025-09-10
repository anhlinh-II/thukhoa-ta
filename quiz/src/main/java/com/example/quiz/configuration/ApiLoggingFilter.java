package com.example.quiz.configuration;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
// @Component  // Disabled to avoid duplicate logs with ControllerLoggingAspect
public class ApiLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String fullUrl = uri + (queryString != null ? "?" + queryString : "");
        
        // Log API start
        long startTime = System.currentTimeMillis();
        log.info("🚀 API START: {} {} - Request from: {}", 
                method, fullUrl, httpRequest.getRemoteAddr());
        
        try {
            // Continue with the request
            chain.doFilter(request, response);
            
            // Log API end with duration
            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ API END: {} {} - Status: {} - Duration: {}ms", 
                    method, fullUrl, httpResponse.getStatus(), duration);
                    
        } catch (Exception e) {
            // Log API error
            long duration = System.currentTimeMillis() - startTime;
            log.error("❌ API ERROR: {} {} - Duration: {}ms - Error: {}", 
                    method, fullUrl, duration, e.getMessage());
            throw e;
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("🔧 API Logging Filter initialized");
    }

    @Override
    public void destroy() {
        log.info("🔧 API Logging Filter destroyed");
    }
}
