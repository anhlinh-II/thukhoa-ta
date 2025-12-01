package com.example.quiz.service.storage;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucket;

    private MinioClient client;

    @PostConstruct
    public void init() {
        client = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
        try {
            boolean exists = client.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(io.minio.MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            // Don't fail application startup if MinIO is not available (e.g., during unit tests)
            // Log a warning and keep client as null so callers can handle unavailability.
            System.err.println("[WARN] MinIO init failed: " + e.getMessage());
            client = null;
            return;
        }
    }

    @Override
    public String upload(MultipartFile file, String storageType, String folder, String filename) throws Exception {
        if (client == null) throw new IllegalStateException("MinIO client is not initialized");
        String safeFolder = (folder == null || folder.isBlank()) ? "" : folder.replaceAll("^/+|/+$", "") + "/";
        String ext = "";
        if (filename == null || filename.isBlank()) {
            String orig = file.getOriginalFilename();
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf('.'));
            }
            filename = UUID.randomUUID().toString() + ext;
        }
        String objectName = storageType + "/" + safeFolder + filename;

        try (InputStream is = file.getInputStream()) {
            client.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(is, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        }

        // Return a presigned GET URL so frontend can access the object directly (expires in 1 hour)
        String presigned = client.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucket)
                .object(objectName)
                .expiry(60 * 60)
                .build());
        return presigned;
    }

    @Override
    public void delete(String path) throws Exception {
        if (client == null) throw new IllegalStateException("MinIO client is not initialized");
        String objectPath = normalizePath(path);
        client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectPath).build());
    }

    @Override
    public Resource download(String path) throws Exception {
        if (client == null) throw new IllegalStateException("MinIO client is not initialized");
        String objectPath = normalizePath(path);
        InputStream is = client.getObject(GetObjectArgs.builder().bucket(bucket).object(objectPath).build());
        return new InputStreamResource(is);
    }

    // If given a full presigned URL or public URL, strip prefix to get object name.
    private String normalizePath(String path) {
        if (path == null) return null;
        String base = (minioUrl != null) ? minioUrl.replaceAll("/+$", "") : "";
        String prefix = base + "/" + bucket + "/";
        if (path.startsWith(prefix)) {
            return path.substring(prefix.length());
        }
        // Also handle if path equals bucket/object or already object name
        if (path.startsWith(bucket + "/")) {
            return path.substring((bucket + "/").length());
        }
        // If path contains ? (presigned URL), extract path part after bucket/
        if (path.contains("/" + bucket + "/")) {
            int idx = path.indexOf("/" + bucket + "/");
            return path.substring(idx + bucket.length() + 2).split("\\?")[0];
        }
        // fallback: return as-is
        return path;
    }
}
