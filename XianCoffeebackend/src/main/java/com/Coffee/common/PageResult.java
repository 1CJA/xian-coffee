package com.Coffee.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分页查询返回对象。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {

    /** 当前页数据。 */
    private List<T> list;

    /** 总记录数。 */
    private Long total;

    /** 当前页码。 */
    private Integer page;

    /** 每页条数。 */
    private Integer pageSize;
}