package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 会员地址实体。
 */
@Data
public class Address {
    private Long id;
    private Long memberId;
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String city;
    private String district;
    private String detail;
    private Integer isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}