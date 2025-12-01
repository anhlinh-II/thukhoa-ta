package com.example.quiz.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.google.auth.oauth2.GoogleCredentials;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${gemini.api.key:}")
    private String geminiApiKey; 

    @Value("${gemini.model:models/text-bison-001}")
    private String geminiModel;
    
    @Value("${local.ai.url:}")
    private String localAiUrl;

    @Value("${google.credentials.path:}")
    private String googleCredentialsPath;

    private final RestTemplate rest = new RestTemplate();

    @PostMapping("/ask")
    public Map<String, Object> ask(@RequestBody Map<String, Object> body) {
        String prompt = (String) body.getOrDefault("prompt", "");
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");
        }

        // If a local AI URL is configured, prefer forwarding the prompt there.
        if (localAiUrl != null && !localAiUrl.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                Map<String, Object> payload = Map.of("prompt", prompt);
                HttpEntity<Map<String, Object>> reqLocal = new HttpEntity<>(payload, headers);
                ResponseEntity<Map> resp = rest.postForEntity(localAiUrl, reqLocal, Map.class);
                if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                    // Expect local service to return { answer: '...' } or { output: '...' } or raw string
                    Map bodyResp = resp.getBody();
                    if (bodyResp.get("answer") != null) {
                        return Map.of("answer", bodyResp.get("answer"));
                    }
                    if (bodyResp.get("output") != null) {
                        return Map.of("answer", bodyResp.get("output"));
                    }
                    // fallback: return the whole body as answer
                    return Map.of("answer", bodyResp);
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Local AI returned non-200 status");
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Local AI request failed: " + e.getMessage());
            }
        }

        // Try to obtain a Google access token from service account credentials (preferred over API key)
        String accessToken = null;
        try {
            GoogleCredentials credentials = null;
            if (googleCredentialsPath != null && !googleCredentialsPath.isBlank()) {
                try (FileInputStream fis = new FileInputStream(googleCredentialsPath)) {
                    credentials = GoogleCredentials.fromStream(fis).createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
                }
            } else {
                // Uses GOOGLE_APPLICATION_CREDENTIALS if set in environment
                credentials = GoogleCredentials.getApplicationDefault().createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
            }
            if (credentials != null) {
                credentials.refreshIfExpired();
                if (credentials.getAccessToken() != null) {
                    accessToken = credentials.getAccessToken().getTokenValue();
                }
            }
        } catch (IOException e) {
            // Could not obtain ADC token; will fall back to API key if present
        }

        // Build request to Google's Generative Language API (v1beta2)
        String url = String.format("https://generativelanguage.googleapis.com/v1beta2/%s:generateText", geminiModel);

        // Payload shape according to API: { prompt: { text: '...' } }
        Map<String, Object> payload = Map.of("prompt", Map.of("text", prompt));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (accessToken != null) {
            headers.setBearerAuth(accessToken);
        } else if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            // If no access token, fall back to API key as query param
            url = url + "?key=" + geminiApiKey;
        } else {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No AI credentials configured (set GOOGLE_APPLICATION_CREDENTIALS or gemini.api.key)");
        }

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> resp = rest.postForEntity(url, req, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                // Attempt to extract answer text:
                Object candidates = resp.getBody().get("candidates");
                if (candidates instanceof java.util.List && !((java.util.List)candidates).isEmpty()) {
                    Object first = ((java.util.List)candidates).get(0);
                    if (first instanceof Map && ((Map) first).get("output") != null) {
                        return Map.of("answer", ((Map) first).get("output"));
                    }
                    // older responses may use 'content'
                    if (first instanceof Map && ((Map) first).get("content") != null) {
                        return Map.of("answer", ((Map) first).get("content"));
                    }
                }

                // fallback: return raw body
                return Map.of("answer", resp.getBody());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider returned non-200 status");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI request failed: " + e.getMessage());
        }
    }
}
