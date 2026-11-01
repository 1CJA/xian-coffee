package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Member;
import com.Coffee.service.MemberService;
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
 * 会员接口控制器。
 */
@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    /** 查询全部会员。 */
    @GetMapping
    public Result listAll() {
        return Result.success(memberService.listAll());
    }

    /** 分页查询会员。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(memberService.page(keyword, status, page, pageSize));
    }

    /** 根据ID查询会员。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(memberService.getById(id));
    }

    /** 查询会员优惠券。 */
    @GetMapping("/{id}/coupons")
    public Result listCoupons(@PathVariable Long id) {
        return Result.success(memberService.listCoupons(id));
    }

    /** 新增会员。 */
    @PostMapping
    public Result create(@RequestBody Member member) {
        return Result.success(memberService.create(member));
    }

    /** 修改会员。 */
    @PutMapping
    public Result update(@RequestBody Member member) {
        return Result.success(memberService.update(member));
    }

    /** 禁用会员。 */
    /** 兑换会员集点奖励。 */
    @PostMapping("/{id}/redeem-stamp")
    public Result redeemStamp(@PathVariable Long id) {
        return Result.success(memberService.redeemStamp(id));
    }
    @DeleteMapping("/{id}")
    public Result disable(@PathVariable Long id) {
        memberService.disable(id);
        return Result.success();
    }
}