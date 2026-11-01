package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Product;
import com.Coffee.entity.ProductSpecOptionView;
import com.Coffee.mapper.ProductMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 商品业务层。
 */
@Service
public class ProductService {

    private static final Pattern PRICE_SUFFIX = Pattern.compile("\\s*\\+\\d+(\\.\\d+)?$");

    private final ProductMapper productMapper;
    private final ImageUrlUtil imageUrlUtil;

    public ProductService(ProductMapper productMapper, ImageUrlUtil imageUrlUtil) {
        this.productMapper = productMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 查询全部商品。 */
    public List<Product> listAll() {
        List<Product> products = productMapper.selectAll();
        products.forEach(this::fillDisplayData);
        return products;
    }

    /** 分页查询商品。 */
    public PageResult<Product> page(String keyword, Long categoryId, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Product> list = productMapper.selectPage(keyword, categoryId, status, offset, safePageSize);
        list.forEach(this::fillDisplayData);
        Long total = productMapper.countPage(keyword, categoryId, status);
        return new PageResult<>(list, total, safePage, safePageSize);
    }

    /** 根据ID查询商品。 */
    public Product getById(Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        fillDisplayData(product);
        return product;
    }

    /** 新增商品。 */
    @Transactional(rollbackFor = Exception.class)
    public Product create(Product product) {
        checkProduct(product);
        if (product.getSalesCount() == null) {
            product.setSalesCount(0);
        }
        if (product.getStock() == null) {
            product.setStock(999);
        }
        if (product.getStatus() == null) {
            product.setStatus(1);
        }
        productMapper.insert(product);
        if (product.getSpecOptions() != null) {
            replaceSpecOptions(product);
        }
        return getById(product.getId());
    }

    /** 修改商品。 */
    @Transactional(rollbackFor = Exception.class)
    public Product update(Product product) {
        if (product.getId() == null || productMapper.selectById(product.getId()) == null) {
            throw new RuntimeException("商品不存在");
        }
        checkProduct(product);
        productMapper.update(product);
        if (product.getSpecOptions() != null) {
            replaceSpecOptions(product);
        }
        return getById(product.getId());
    }

    /** 删除商品。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        if (productMapper.selectById(id) == null) {
            throw new RuntimeException("商品不存在");
        }
        productMapper.deleteSpecOptionsByProductId(id);
        productMapper.deleteById(id);
    }

    /** 校验商品必填项。 */
    private void checkProduct(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new RuntimeException("商品名称不能为空");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("商品价格不正确");
        }
    }

    /** 补充展示字段。 */
    private void fillDisplayData(Product product) {
        fillImageUrl(product);
        fillSpecOptions(product);
    }

    /** 补充图片URL。 */
    private void fillImageUrl(Product product) {
        product.setImageUrl(imageUrlUtil.buildUrl(product.getImagePath()));
        product.setDetailImageUrl(imageUrlUtil.buildUrl(product.getDetailImagePath()));
    }

    /** 补充商品规格选项。 */
    private void fillSpecOptions(Product product) {
        Map<String, List<String>> specOptions = new LinkedHashMap<>();
        List<ProductSpecOptionView> rows = productMapper.selectSpecOptionsByProductId(product.getId());
        rows.forEach(row -> specOptions
                .computeIfAbsent(row.getGroupCode(), key -> new ArrayList<>())
                .add(formatSpecOption(row)));
        product.setSpecOptions(specOptions);
    }

    /** 重写商品规格关联。 */
    private void replaceSpecOptions(Product product) {
        productMapper.deleteSpecOptionsByProductId(product.getId());
        product.getSpecOptions().forEach((groupCode, optionLabels) -> {
            List<String> optionNames = cleanOptionNames(optionLabels);
            if (groupCode == null || groupCode.isBlank() || optionNames.isEmpty()) {
                return;
            }
            List<Long> optionIds = productMapper.selectSpecOptionIds(groupCode, optionNames);
            optionIds.forEach(optionId -> productMapper.insertSpecOption(product.getId(), optionId));
        });
    }

    /** 格式化规格选项名称。 */
    private String formatSpecOption(ProductSpecOptionView row) {
        BigDecimal price = row.getPriceDelta() == null ? BigDecimal.ZERO : row.getPriceDelta();
        if (price.compareTo(BigDecimal.ZERO) > 0) {
            return row.getOptionName() + " +" + price.stripTrailingZeros().toPlainString();
        }
        return row.getOptionName();
    }

    /** 去掉规格加价后缀。 */
    private List<String> cleanOptionNames(List<String> optionLabels) {
        if (optionLabels == null) {
            return List.of();
        }
        return optionLabels.stream()
                .map(this::cleanOptionName)
                .filter(name -> !name.isBlank())
                .distinct()
                .toList();
    }

    /** 提取规格原始名称。 */
    private String cleanOptionName(String optionLabel) {
        if (optionLabel == null) {
            return "";
        }
        return PRICE_SUFFIX.matcher(optionLabel.trim()).replaceAll("");
    }
}