package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 会员优惠券实体。
 */
@Data
public class MemberCoupon {
    private Long id;
    private Long memberId;
    private Long couponId;
    private String status;
    private LocalDateTime receivedAt;
    private LocalDateTime usedAt;
    private Long orderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}