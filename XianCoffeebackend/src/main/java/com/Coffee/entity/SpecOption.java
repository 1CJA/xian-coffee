package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品规格选项实体。
 */
@Data
public class SpecOption {
    private Long id;
    private Long groupId;
    private String groupName;
    private String name;
    private BigDecimal priceDelta;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}