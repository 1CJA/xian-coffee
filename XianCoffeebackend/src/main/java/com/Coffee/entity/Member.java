package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 会员实体。
 */
@Data
public class Member {
    private Long id;
    private String openid;
    private String nickname;
    private String phone;
    private String password;
    private String avatarUrl;
    private String levelName;
    private Integer points;
    private BigDecimal balance;
    private Integer stampCount;
    private Integer stampExchangeCount;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer coupons;
    private List<MemberCoupon> couponList;
}