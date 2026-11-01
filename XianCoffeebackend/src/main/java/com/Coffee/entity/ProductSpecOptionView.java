package com.Coffee.entity;

import lombok.Data;

import java.math.BigDecimal;

/** 商品规格展示数据。 */
@Data
public class ProductSpecOptionView {
    private String groupCode;
    private String optionName;
    private BigDecimal priceDelta;
}