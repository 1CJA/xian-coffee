package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Category;
import com.Coffee.mapper.CategoryMapper;
import com.Coffee.mapper.ProductMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 分类业务层。
 */
@Service
public class CategoryService {

    private final CategoryMapper categoryMapper;
    private final ProductMapper productMapper;

    public CategoryService(CategoryMapper categoryMapper, ProductMapper productMapper) {
        this.categoryMapper = categoryMapper;
        this.productMapper = productMapper;
    }

    /** 查询全部分类。 */
    public List<Category> listAll() {
        return categoryMapper.selectAll();
    }

    /** 分页查询分类。 */
    public PageResult<Category> page(String keyword, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Category> list = categoryMapper.selectPage(keyword, status, offset, safePageSize);
        Long total = categoryMapper.countPage(keyword, status);
        return new PageResult<>(list, total, safePage, safePageSize);
    }

    /** 根据ID查询分类。 */
    public Category getById(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new RuntimeException("分类不存在");
        }
        return category;
    }

    /** 新增分类。 */
    public Category create(Category category) {
        checkCategory(category);
        if (category.getSortOrder() == null) {
            category.setSortOrder(0);
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        categoryMapper.insert(category);
        return getById(category.getId());
    }

    /** 修改分类。 */
    public Category update(Category category) {
        if (category.getId() == null || categoryMapper.selectById(category.getId()) == null) {
            throw new RuntimeException("分类不存在");
        }
        checkCategory(category);
        categoryMapper.update(category);
        return getById(category.getId());
    }

    /** 删除分类。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        if (categoryMapper.selectById(id) == null) {
            throw new RuntimeException("分类不存在");
        }
        productMapper.clearCategoryId(id);
        categoryMapper.deleteById(id);
    }

    /** 校验分类必填项。 */
    private void checkCategory(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new RuntimeException("分类名称不能为空");
        }
    }
}