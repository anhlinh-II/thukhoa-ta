package com.example.quiz.service.storage;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
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

        return objectName;
    }

    @Override
    public void delete(String path) throws Exception {
        if (client == null) throw new IllegalStateException("MinIO client is not initialized");
        client.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(path).build());
    }

    @Override
    public Resource download(String path) throws Exception {
        if (client == null) throw new IllegalStateException("MinIO client is not initialized");
        InputStream is = client.getObject(GetObjectArgs.builder().bucket(bucket).object(path).build());
        return new InputStreamResource(is);
    }
}
