package com.example.quiz.controller;

import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.service.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
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

    @GetMapping("/view")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> view(@RequestParam("path") String path) throws Exception {
        Resource res = storageService.download(path);
        String filename = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;

        MediaType mediaType = MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(res);
    }

    // Public view endpoint (no authentication) so browser <img> can load images without Authorization header
    @GetMapping("/public/view")
    public ResponseEntity<Resource> publicView(@RequestParam("path") String path) throws Exception {
        // If the path looks like a bundled static avatar (e.g. /avatar/avatar2.jpg), try to serve
        // it from classpath:/static first so we don't require those files to exist in MinIO.
        try {
            String cleanPath = path.startsWith("/") ? path.substring(1) : path; // remove leading slash
            if (cleanPath.startsWith("avatar/")) {
                ClassPathResource cp = new ClassPathResource("static/" + cleanPath);
                if (cp.exists() && cp.isReadable()) {
                    String filename = cleanPath.contains("/") ? cleanPath.substring(cleanPath.lastIndexOf('/') + 1) : cleanPath;
                    MediaType mediaType = MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM);
                    return ResponseEntity.ok()
                            .contentType(mediaType)
                            .body(cp);
                }
            }

            // Fallback to storage (MinIO) for other paths or when static resource not found
            Resource res = storageService.download(path);
            String filename = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
            MediaType mediaType = MediaTypeFactory.getMediaType(filename).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(res);
        } catch (Exception ex) {
            // Don't propagate MinIO NoSuchKey as a server exception here; return 404 so <img> shows broken image
            return ResponseEntity.notFound().build();
        }
    }
}
