package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 门店实体。
 */
@Data
public class Store {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String businessHours;
    private String imagePath;
    private String videoPath;
    private String imageUrl;
    private String videoUrl;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}