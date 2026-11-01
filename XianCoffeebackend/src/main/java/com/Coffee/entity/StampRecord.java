package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 集点记录实体。
 */
@Data
public class StampRecord {
    private Long id;
    private Long memberId;
    private Long orderId;
    private Integer changeCount;
    private String recordType;
    private Long exchangeCouponId;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String memberName;
    private String phone;
    private String avatarUrl;
}