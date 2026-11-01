package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 轮播图实体。
 */
@Data
public class Banner {
    private Long id;
    private String title;
    private String imagePath;
    private String imageUrl;
    private String linkType;
    private String linkValue;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}