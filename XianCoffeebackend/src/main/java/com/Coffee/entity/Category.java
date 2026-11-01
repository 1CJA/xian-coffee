package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 商品分类实体。
 */
@Data
public class Category {
    private Long id;
    private String name;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer productCount;
}