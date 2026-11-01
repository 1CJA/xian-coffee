package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 优惠券实体。
 */
@Data
public class Coupon {
    private Long id;
    private String name;
    private String type;
    private BigDecimal amount;
    private BigDecimal minAmount;
    private String imagePath;
    private String imageUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalCount;
    private Integer status;
    private String ruleText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}