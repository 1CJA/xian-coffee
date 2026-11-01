package com.Coffee.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一接口响应结果。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

    /**
     * 业务状态码。
     */
    private Integer code;

    /**
     * 响应提示信息。
     */
    private String message;

    /**
     * 响应数据。
     */
    private Object data;

    /**
     * 返回无数据成功响应。
     *
     * @return 成功响应
     */
    public static Result success() {
        return new Result(1, "success", null);
    }

    /**
     * 返回带数据成功响应。
     *
     * @param data 响应数据
     * @return 成功响应
     */
    public static Result success(Object data) {
        return new Result(1, "success", data);
    }

    /**
     * 返回失败响应。
     *
     * @param message 错误信息
     * @return 失败响应
     */
    public static Result error(String message) {
        return new Result(0, message, null);
    }
}
