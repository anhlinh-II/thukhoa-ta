package com.example.quiz.controller;

import com.example.quiz.dto.ai.AiAskRequest;
import com.example.quiz.dto.ai.AiAskResponse;
import com.example.quiz.dto.ai.GeminiRequest;
import com.example.quiz.dto.ai.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${gemini.api.key:}")
    private String geminiApiKey; 

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;
    
    @Value("${local.ai.url:}")
    private String localAiUrl;

    private final RestTemplate rest = new RestTemplate();

    @PostMapping("/ask")
    public AiAskResponse ask(@RequestBody AiAskRequest request) {
        String prompt = request.getPrompt();
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prompt is required");
        }

        // If a local AI URL is configured, prefer forwarding the prompt there
        if (localAiUrl != null && !localAiUrl.isBlank()) {
            return callLocalAi(prompt);
        }

        // Use Gemini API with API key
        return callGeminiApi(prompt);
    }

    private AiAskResponse callLocalAi(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            AiAskRequest payload = new AiAskRequest(prompt);
            HttpEntity<AiAskRequest> reqLocal = new HttpEntity<>(payload, headers);
            
            ResponseEntity<AiAskResponse> resp = rest.postForEntity(localAiUrl, reqLocal, AiAskResponse.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return resp.getBody();
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Local AI returned non-200 status");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Local AI request failed: " + e.getMessage());
        }
    }

    private AiAskResponse callGeminiApi(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini API key not configured");
        }

        // Ensure model name has "models/" prefix
        String modelName = geminiModel;
        if (!modelName.startsWith("models/")) {
            modelName = "models/" + modelName;
        }

        // Build Gemini API URL with API key
        String url = String.format("https://generativelanguage.googleapis.com/v1/%s:generateContent?key=%s", 
            modelName, geminiApiKey);

        // Create request payload using DTO
        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest payload = new GeminiRequest(List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<GeminiRequest> req = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<GeminiResponse> resp = rest.postForEntity(url, req, GeminiResponse.class);
            
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                GeminiResponse geminiResp = resp.getBody();
                
                // Extract answer from response
                if (geminiResp.getCandidates() != null && !geminiResp.getCandidates().isEmpty()) {
                    GeminiResponse.Candidate candidate = geminiResp.getCandidates().get(0);
                    if (candidate.getContent() != null && 
                        candidate.getContent().getParts() != null && 
                        !candidate.getContent().getParts().isEmpty()) {
                        String text = candidate.getContent().getParts().get(0).getText();
                        return new AiAskResponse(text);
                    }
                }
                
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid response format from Gemini");
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini API returned non-200 status");
            }
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini API request failed: " + e.getMessage());
        }
    }
}
