package com.Coffee.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品规格组实体。
 */
@Data
public class SpecGroup {
    private Long id;
    private String name;
    private String code;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SpecOption> options;
}