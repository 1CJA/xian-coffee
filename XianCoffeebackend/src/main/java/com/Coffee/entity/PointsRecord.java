package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分记录实体。
 */
@Data
public class PointsRecord {
    private Long id;
    private Long memberId;
    private Long orderId;
    private Integer changePoints;
    private String recordType;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}