package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Banner;
import com.Coffee.service.BannerService;
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
 * 轮播图接口控制器。
 */
@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerService bannerService;

    public BannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    /** 查询全部轮播图。 */
    @GetMapping
    public Result listAll() {
        return Result.success(bannerService.listAll());
    }

    /** 分页查询轮播图。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(bannerService.page(keyword, status, page, pageSize));
    }

    /** 根据ID查询轮播图。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(bannerService.getById(id));
    }

    /** 新增轮播图。 */
    @PostMapping
    public Result create(@RequestBody Banner banner) {
        return Result.success(bannerService.create(banner));
    }

    /** 修改轮播图。 */
    @PutMapping
    public Result update(@RequestBody Banner banner) {
        return Result.success(bannerService.update(banner));
    }

    /** 删除轮播图。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        bannerService.delete(id);
        return Result.success();
    }
}