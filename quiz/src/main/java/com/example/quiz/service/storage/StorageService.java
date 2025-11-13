package com.example.quiz.service.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    /**
     * Uploads a file to storage under the specified storageType/folder and returns the stored path.
     */
    String upload(MultipartFile file, String storageType, String folder, String filename) throws Exception;

    /** Delete file by path (relative path inside bucket) */
    void delete(String path) throws Exception;

    /**
     * Download file as Resource by path
     */
    Resource download(String path) throws Exception;
}
