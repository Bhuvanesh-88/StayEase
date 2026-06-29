package com.stayease.propertyservice.repository;

import com.stayease.propertyservice.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, Long> {

    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.propertyId = :propertyId ORDER BY pi.displayOrder ASC")
    List<PropertyImage> findByPropertyIdOrderByDisplayOrder(@Param("propertyId") Long propertyId);
}