package com.example.quiz.controller;

import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileStorageController {

    private final StorageService storageService;

    // Allow authenticated users; admin endpoints can still call these if needed
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> upload(@RequestParam("file") MultipartFile file,
                                      @RequestParam("storageType") String storageType,
                                      @RequestParam(value = "folder", required = false) String folder,
                                      @RequestParam(value = "filename", required = false) String filename) throws Exception {
        String path = storageService.upload(file, storageType, folder, filename);
        return ApiResponse.successOf(path);
    }

    @DeleteMapping("")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> delete(@RequestParam("path") String path) throws Exception {
        storageService.delete(path);
        return ApiResponse.successOf(null);
    }

    @GetMapping("/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@RequestParam("path") String path) throws Exception {
        Resource res = storageService.download(path);
        String filename = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .body(res);
    }
}
