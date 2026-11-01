package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Category;
import com.Coffee.service.CategoryService;
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
 * 分类接口控制器。
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /** 查询全部分类。 */
    @GetMapping
    public Result listAll() {
        return Result.success(categoryService.listAll());
    }

    /** 分页查询分类。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(categoryService.page(keyword, status, page, pageSize));
    }

    /** 根据ID查询分类。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }

    /** 新增分类。 */
    @PostMapping
    public Result create(@RequestBody Category category) {
        return Result.success(categoryService.create(category));
    }

    /** 修改分类。 */
    @PutMapping
    public Result update(@RequestBody Category category) {
        return Result.success(categoryService.update(category));
    }

    /** 删除分类。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}