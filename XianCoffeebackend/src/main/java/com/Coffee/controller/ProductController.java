package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.Product;
import com.Coffee.service.ProductService;
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
 * 商品接口控制器。
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /** 查询全部商品。 */
    @GetMapping
    public Result listAll() {
        return Result.success(productService.listAll());
    }

    /** 分页查询商品。 */
    @GetMapping("/page")
    public Result page(@RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Long categoryId,
                       @RequestParam(required = false) Integer status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(productService.page(keyword, categoryId, status, page, pageSize));
    }

    /** 根据ID查询商品。 */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id) {
        return Result.success(productService.getById(id));
    }

    /** 新增商品。 */
    @PostMapping
    public Result create(@RequestBody Product product) {
        return Result.success(productService.create(product));
    }

    /** 修改商品。 */
    @PutMapping
    public Result update(@RequestBody Product product) {
        return Result.success(productService.update(product));
    }

    /** 删除商品。 */
    @DeleteMapping("/{id}")
    public Result delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success();
    }
}