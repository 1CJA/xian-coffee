package com.Coffee.exception;

import com.Coffee.common.Result;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常统一处理。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理运行时异常。
     *
     * @param exception 异常对象
     * @return 统一错误响应
     */
    @ExceptionHandler(RuntimeException.class)
    public Result handleRuntimeException(RuntimeException exception) {
        return Result.error(exception.getMessage());
    }

    /**
     * 处理未知异常。
     *
     * @param exception 异常对象
     * @return 统一错误响应
     */
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception exception) {
        return Result.error("服务器异常，请稍后再试");
    }
}
