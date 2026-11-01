package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单明细实体。
 */
@Data
public class OrderItem {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String productImagePath;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private String specText;
    private BigDecimal itemAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}