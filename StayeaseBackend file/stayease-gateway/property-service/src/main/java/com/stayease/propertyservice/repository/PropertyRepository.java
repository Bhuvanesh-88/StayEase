package com.stayease.propertyservice.repository;

import com.stayease.propertyservice.entity.Property;
import com.stayease.propertyservice.entity.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByOwnerId(Long ownerId);

    List<Property> findByCityContainingIgnoreCase(String city);

    List<Property> findByPropertyType(PropertyType propertyType);

    List<Property> findByCityContainingIgnoreCaseAndPropertyType(String city, PropertyType propertyType);

    List<Property> findByMonthlyRentBetween(Double minRent, Double maxRent);

    List<Property> findByCityContainingIgnoreCaseAndMonthlyRentBetween(String city, Double minRent, Double maxRent);

    List<Property> findByPropertyTypeAndMonthlyRentBetween(PropertyType propertyType, Double minRent, Double maxRent);

    List<Property> findByCityContainingIgnoreCaseAndPropertyTypeAndMonthlyRentBetween(
            String city, PropertyType propertyType, Double minRent, Double maxRent
    );

    long countByOwnerId(Long ownerId);
}