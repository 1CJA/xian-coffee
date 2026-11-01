package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单实体。
 */
@Data
public class Order {
    private Long id;
    private String orderNo;
    private Long memberId;
    private String memberName;
    private String memberPhone;
    private Long storeId;
    private String storeName;
    private Long addressId;
    private String orderType;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal couponAmount;
    private BigDecimal pointsAmount;
    private BigDecimal payAmount;
    private Integer usePoints;
    private Long memberCouponId;
    private String remark;
    private String pickupCode;
    private LocalDateTime payTime;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItem> orderItems;
}