package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Store;
import com.Coffee.service.StoreService;
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
 * 门店接口控制器。
 */
@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    /** 查询全部门店。 */
    @GetMapping
    public Result listAll() {
        return Result.success(storeService.listAll());
    }

    /** 分页查询门店。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(storeService.page(keyword, status, page, pageSize));
    }

    /** 根据ID查询门店。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(storeService.getById(id));
    }

    /** 新增门店。 */
    @PostMapping
    public Result create(@RequestBody Store store) {
        return Result.success(storeService.create(store));
    }

    /** 修改门店。 */
    @PutMapping
    public Result update(@RequestBody Store store) {
        return Result.success(storeService.update(store));
    }

    /** 删除门店。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        storeService.delete(id);
        return Result.success();
    }
}