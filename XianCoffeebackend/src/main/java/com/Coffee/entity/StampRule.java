package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 集点规则实体。
 */
@Data
public class StampRule {
    private Long id;
    private String name;
    private Integer targetCount;
    private Long rewardCouponId;
    private Integer validDays;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}