package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.SpecGroup;
import com.Coffee.entity.SpecOption;
import com.Coffee.service.SpecService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商品规格接口控制器。
 */
@RestController
@RequestMapping("/api/specs")
public class SpecController {

    private final SpecService specService;

    public SpecController(SpecService specService) {
        this.specService = specService;
    }

    /** 查询规格组和选项。 */
    @GetMapping
    public Result listGroups() {
        return Result.success(specService.listGroups());
    }

    /** 查询全部规格选项。 */
    @GetMapping("/options")
    public Result listOptions() {
        return Result.success(specService.listOptions());
    }

    /** 新增规格组。 */
    @PostMapping("/groups")
    public Result createGroup(@RequestBody SpecGroup group) {
        return Result.success(specService.createGroup(group));
    }

    /** 修改规格组。 */
    @PutMapping("/groups")
    public Result updateGroup(@RequestBody SpecGroup group) {
        return Result.success(specService.updateGroup(group));
    }

    /** 删除规格组。 */
    @DeleteMapping("/groups/{id}")
    public Result deleteGroup(@PathVariable Long id) {
        specService.deleteGroup(id);
        return Result.success();
    }

    /** 新增规格选项。 */
    @PostMapping("/options")
    public Result createOption(@RequestBody SpecOption option) {
        return Result.success(specService.createOption(option));
    }

    /** 修改规格选项。 */
    @PutMapping("/options")
    public Result updateOption(@RequestBody SpecOption option) {
        return Result.success(specService.updateOption(option));
    }

    /** 删除规格选项。 */
    @DeleteMapping("/options/{id}")
    public Result deleteOption(@PathVariable Long id) {
        specService.deleteOption(id);
        return Result.success();
    }
}