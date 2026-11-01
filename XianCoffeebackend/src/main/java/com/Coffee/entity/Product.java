package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 商品实体。
 */
@Data
public class Product {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String shortName;
    private String description;
    private String detailDescription;
    private BigDecimal price;
    private String imagePath;
    private String detailImagePath;
    private String imageUrl;
    private String detailImageUrl;
    private Map<String, List<String>> specOptions;
    private Integer salesCount;
    private Integer stock;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}