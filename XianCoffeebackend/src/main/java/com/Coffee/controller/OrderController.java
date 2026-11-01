package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Order;
import com.Coffee.service.OrderService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 订单接口控制器。
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** 分页查询订单。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) String status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(orderService.page(keyword, status, page, pageSize));
    }

    /** 根据ID查询订单。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(orderService.getById(id));
    }

    /** 新增订单。 */
    @PostMapping
    public Result create(@RequestBody Order order) {
        return Result.success(orderService.create(order));
    }

    /** 支付订单。 */
    @PutMapping("/{id}/pay")
    public Result pay(@PathVariable Long id) {
        return Result.success(orderService.pay(id));
    }

    /** 取消订单。 */
    @PutMapping("/{id}/cancel")
    public Result cancel(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return Result.success(orderService.cancel(id, reason));
    }

    /** 修改订单状态。 */
    @PutMapping("/{id}/status")
    public Result updateStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.success(orderService.updateStatus(id, status));
    }

    /** 删除订单。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.success();
    }
}