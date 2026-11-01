package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Address;
import com.Coffee.service.AddressService;
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
 * 地址接口控制器。
 */
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    /** 查询会员地址。 */
    @GetMapping
    public Result listByMemberId(@RequestParam Long memberId) {
        return Result.success(addressService.listByMemberId(memberId));
    }

    /** 根据ID查询地址。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(addressService.getById(id));
    }

    /** 新增地址。 */
    @PostMapping
    public Result create(@RequestBody Address address) {
        return Result.success(addressService.create(address));
    }

    /** 修改地址。 */
    @PutMapping
    public Result update(@RequestBody Address address) {
        return Result.success(addressService.update(address));
    }

    /** 删除地址。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        addressService.delete(id);
        return Result.success();
    }
}