// service/PropertyService.java
package com.stayease.propertyservice.service;

import com.stayease.propertyservice.dto.PropertyDetailsDto;
import com.stayease.propertyservice.dto.PropertyRequestDto;
import com.stayease.propertyservice.dto.PropertyResponseDto;
import com.stayease.propertyservice.dto.PropertyImageDto;
import com.stayease.propertyservice.dto.RoomResponseDto;
import com.stayease.propertyservice.entity.Property;
import com.stayease.propertyservice.entity.PropertyImage;
import com.stayease.propertyservice.entity.PropertyType;
import com.stayease.propertyservice.entity.Room;
import com.stayease.propertyservice.exception.BadRequestException;
import com.stayease.propertyservice.exception.ResourceNotFoundException;
import com.stayease.propertyservice.repository.PropertyRepository;
import com.stayease.propertyservice.repository.PropertyImageRepository;
import com.stayease.propertyservice.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;


@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final RoomRepository roomRepository;

    public PropertyService(PropertyRepository propertyRepository,
                           PropertyImageRepository propertyImageRepository,
                           RoomRepository roomRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.roomRepository = roomRepository;
    }

    public PropertyResponseDto createProperty(PropertyRequestDto dto) {
        validatePropertyDto(dto);

        Property property = new Property();
        property.setOwnerId(dto.getOwnerId());
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPropertyType(parsePropertyType(dto.getPropertyType()));
        property.setAddressLine(dto.getAddressLine());
        property.setCity(dto.getCity());
        property.setState(dto.getState());
        property.setPincode(dto.getPincode());
        property.setMonthlyRent(dto.getMonthlyRent());
        property.setAmenities(dto.getAmenities() != null ? new ArrayList<>(dto.getAmenities()) : new ArrayList<>());
        property.setCreatedAt(LocalDateTime.now());
        property.setImages(new ArrayList<>());

        Property savedProperty = propertyRepository.save(property);
        return mapPropertyToResponse(savedProperty);
    }

    public PropertyResponseDto updateProperty(Long propertyId, PropertyRequestDto dto) {
        validatePropertyDto(dto);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        property.setOwnerId(dto.getOwnerId());
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPropertyType(parsePropertyType(dto.getPropertyType()));
        property.setAddressLine(dto.getAddressLine());
        property.setCity(dto.getCity());
        property.setState(dto.getState());
        property.setPincode(dto.getPincode());
        property.setMonthlyRent(dto.getMonthlyRent());
        property.setAmenities(dto.getAmenities() != null ? new ArrayList<>(dto.getAmenities()) : new ArrayList<>());

        return mapPropertyToResponse(propertyRepository.save(property));
    }

    public void deleteProperty(Long propertyId) throws IOException {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        List<PropertyImage> images = propertyImageRepository.findByPropertyIdOrderByDisplayOrder(propertyId);
        propertyImageRepository.deleteAll(images);

        propertyRepository.delete(property);
    }

    public PropertyResponseDto uploadPropertyImage(Long propertyId, MultipartFile file) throws IOException {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        validateImageFile(file);

        byte[] imageBytes = file.getBytes();
        String fileName = file.getOriginalFilename();
        String fileType = file.getContentType();

        int displayOrder = property.getImages().size();

        PropertyImage image = new PropertyImage(fileName, fileType, imageBytes, property, displayOrder);
        propertyImageRepository.save(image);

        return mapPropertyToResponse(property);
    }

    public PropertyResponseDto deletePropertyImage(Long propertyId, Integer imageIndex) throws IOException {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        List<PropertyImage> images = propertyImageRepository.findByPropertyIdOrderByDisplayOrder(propertyId);

        if (imageIndex < 0 || imageIndex >= images.size()) {
            throw new BadRequestException("Invalid image index.");
        }

        PropertyImage imageToDelete = images.get(imageIndex);
        propertyImageRepository.delete(imageToDelete);

        List<PropertyImage> remainingImages = propertyImageRepository.findByPropertyIdOrderByDisplayOrder(propertyId);
        for (int i = 0; i < remainingImages.size(); i++) {
            remainingImages.get(i).setDisplayOrder(i);
        }
        propertyImageRepository.saveAll(remainingImages);

        return mapPropertyToResponse(property);
    }

    public List<PropertyResponseDto> getAllProperties() {
        return propertyRepository.findAll()
                .stream()
                .map(this::mapPropertyToResponse)
                .collect(Collectors.toList());
    }

    public List<PropertyResponseDto> getPropertiesByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapPropertyToResponse)
                .collect(Collectors.toList());
    }

    public PropertyDetailsDto getPropertyDetails(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + propertyId));

        List<Room> rooms = roomRepository.findByPropertyId(propertyId);
        List<RoomResponseDto> roomResponses = (rooms != null) ?
                rooms.stream().map(this::mapRoomToResponse).collect(Collectors.toList()) :
                new ArrayList<>();

        PropertyDetailsDto detailsDto = new PropertyDetailsDto();
        detailsDto.setProperty(mapPropertyToResponse(property));
        detailsDto.setRooms(roomResponses);
        return detailsDto;
    }

    public List<PropertyResponseDto> searchProperties(String city, String propertyType, Double minRent, Double maxRent) {
        List<Property> properties;

        boolean hasCity = city != null && !city.isBlank();
        boolean hasType = propertyType != null && !propertyType.isBlank();
        boolean hasMin = minRent != null;
        boolean hasMax = maxRent != null;

        if (hasMin && !hasMax) maxRent = Double.MAX_VALUE;
        if (!hasMin && hasMax) minRent = 0.0;

        if (hasCity && hasType && hasMin && hasMax) {
            properties = propertyRepository.findByCityContainingIgnoreCaseAndPropertyTypeAndMonthlyRentBetween(
                    city, parsePropertyType(propertyType), minRent, maxRent);
        } else if (hasCity && hasType) {
            properties = propertyRepository.findByCityContainingIgnoreCaseAndPropertyType(
                    city, parsePropertyType(propertyType));
        } else if (hasCity && hasMin && hasMax) {
            properties = propertyRepository.findByCityContainingIgnoreCaseAndMonthlyRentBetween(city, minRent, maxRent);
        } else if (hasType && hasMin && hasMax) {
            properties = propertyRepository.findByPropertyTypeAndMonthlyRentBetween(
                    parsePropertyType(propertyType), minRent, maxRent);
        } else if (hasCity) {
            properties = propertyRepository.findByCityContainingIgnoreCase(city);
        } else if (hasType) {
            properties = propertyRepository.findByPropertyType(parsePropertyType(propertyType));
        } else if (hasMin && hasMax) {
            properties = propertyRepository.findByMonthlyRentBetween(minRent, maxRent);
        } else {
            properties = propertyRepository.findAll();
        }

        return properties.stream()
                .map(this::mapPropertyToResponse)
                .collect(Collectors.toList());
    }

    private void validatePropertyDto(PropertyRequestDto dto) {
        if (dto.getOwnerId() == null) throw new BadRequestException("Owner ID is required.");
        if (dto.getTitle() == null || dto.getTitle().isBlank()) throw new BadRequestException("Title is required.");
        if (dto.getPropertyType() == null || dto.getPropertyType().isBlank()) throw new BadRequestException("Property type is required.");
        if (dto.getMonthlyRent() == null || dto.getMonthlyRent() < 0) throw new BadRequestException("Valid rent is required.");
        if (dto.getAmenities() == null || dto.getAmenities().isEmpty()) throw new BadRequestException("At least one amenity is required.");
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum allowed size (5MB).");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Invalid file type. Only images are allowed.");
        }
    }

    private PropertyType parsePropertyType(String value) {
        try {
            return PropertyType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid property type: " + value);
        }
    }

    private PropertyResponseDto mapPropertyToResponse(Property property) {
        if (property == null) return null;

        PropertyResponseDto dto = new PropertyResponseDto();
        dto.setPropertyId(property.getPropertyId());
        dto.setOwnerId(property.getOwnerId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPropertyType(property.getPropertyType().name());
        dto.setAddressLine(property.getAddressLine());
        dto.setCity(property.getCity());
        dto.setState(property.getState());
        dto.setPincode(property.getPincode());
        dto.setMonthlyRent(property.getMonthlyRent());
        dto.setAmenities(property.getAmenities() != null ? new ArrayList<>(property.getAmenities()) : new ArrayList<>());
        dto.setCreatedAt(property.getCreatedAt());

        List<PropertyImageDto> imageDtos = new ArrayList<>();
        if (property.getImages() != null && !property.getImages().isEmpty()) {
            imageDtos = property.getImages().stream()
                    .map(img -> new PropertyImageDto(
                            img.getImageId(),
                            img.getFileName(),
                            img.getFileType(),
                            Base64.getEncoder().encodeToString(img.getImageData())
                    ))
                    .collect(Collectors.toList());
        }
        dto.setImages(imageDtos);

        return dto;
    }

    private RoomResponseDto mapRoomToResponse(Room room) {
        if (room == null) return null;
        RoomResponseDto dto = new RoomResponseDto();
        dto.setRoomId(room.getRoomId());
        dto.setPropertyId(room.getPropertyId());
        dto.setRoomType(room.getRoomType().name());
        dto.setRent(room.getRent());
        dto.setTotalCount(room.getTotalCount());
        dto.setAvailableCount(room.getAvailableCount());
        dto.setDescription(room.getDescription());
        return dto;
    }
}