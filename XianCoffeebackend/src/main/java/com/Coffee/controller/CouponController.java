package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Coupon;
import com.Coffee.service.CouponService;
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
 * 优惠券接口控制器。
 */
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /** 查询全部优惠券。 */
    @GetMapping
    public Result listAll() {
        return Result.success(couponService.listAll());
    }

    /** 分页查询优惠券。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) String type,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(couponService.page(keyword, type, status, page, pageSize));
    }

    /** 根据ID查询优惠券。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(couponService.getById(id));
    }

    /** 新增优惠券。 */
    @PostMapping
    public Result create(@RequestBody Coupon coupon) {
        return Result.success(couponService.create(coupon));
    }

    /** 修改优惠券。 */
    @PutMapping
    public Result update(@RequestBody Coupon coupon) {
        return Result.success(couponService.update(coupon));
    }

    /** 删除优惠券。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        couponService.delete(id);
        return Result.success();
    }
}