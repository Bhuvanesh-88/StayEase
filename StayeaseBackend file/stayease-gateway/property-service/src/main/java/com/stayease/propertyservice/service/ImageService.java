package com.stayease.propertyservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class ImageService {

    @Value("${property.image.upload-dir:uploads/properties}")
    private String uploadDir;

    @Value("${property.image.max-size:5242880}") // 5MB default
    private long maxFileSize;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
    );

    public String uploadImage(MultipartFile file, Long propertyId) throws IOException {
        validateFile(file);

        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir, "property_" + propertyId);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.write(filePath, file.getBytes());

        // Return relative path for database storage
        return "uploads/properties/property_" + propertyId + "/" + uniqueFilename;
    }

    public void deleteImage(String imagePath) throws IOException {
        if (imagePath == null || imagePath.isEmpty()) {
            return;
        }

        Path filePath = Paths.get(imagePath);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }

    public void deletePropertyImages(Long propertyId) throws IOException {
        Path propertyPath = Paths.get(uploadDir, "property_" + propertyId);
        if (Files.exists(propertyPath)) {
            Files.walk(propertyPath)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            // Log error
                        }
                    });
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size.");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Only images are allowed.");
        }
    }
}