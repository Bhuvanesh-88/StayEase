package com.stayease.propertyservice.dto;

public class PropertyImageDto {
    private Long imageId;
    private String fileName;
    private String fileType;
    private String imageData; // Base64 encoded

    public PropertyImageDto() {
    }

    public PropertyImageDto(Long imageId, String fileName, String fileType, String imageData) {
        this.imageId = imageId;
        this.fileName = fileName;
        this.fileType = fileType;
        this.imageData = imageData;
    }

    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }
}
