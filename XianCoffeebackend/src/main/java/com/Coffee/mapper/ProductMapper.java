package com.Coffee.mapper;

import com.Coffee.entity.Product;
import com.Coffee.entity.ProductSpecOptionView;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 商品数据访问层。
 */
public interface ProductMapper {

    /** 查询全部商品。 */
    @Select("""
            SELECT p.*, c.name AS category_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            ORDER BY p.created_at DESC
            """)
    List<Product> selectAll();

    /** 分页查询商品。 */
    @Select("""
            <script>
            SELECT p.*, c.name AS category_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (p.name LIKE CONCAT('%', #{keyword}, '%') OR p.description LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="categoryId != null">
                    AND p.category_id = #{categoryId}
                </if>
                <if test="status != null">
                    AND p.status = #{status}
                </if>
            </where>
            ORDER BY p.created_at DESC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Product> selectPage(@Param("keyword") String keyword,
                             @Param("categoryId") Long categoryId,
                             @Param("status") Integer status,
                             @Param("offset") Integer offset,
                             @Param("pageSize") Integer pageSize);

    /** 统计商品数量。 */
    @Select("""
            <script>
            SELECT COUNT(*)
            FROM product p
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (p.name LIKE CONCAT('%', #{keyword}, '%') OR p.description LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="categoryId != null">
                    AND p.category_id = #{categoryId}
                </if>
                <if test="status != null">
                    AND p.status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword,
                   @Param("categoryId") Long categoryId,
                   @Param("status") Integer status);

    /** 根据ID查询商品。 */
    @Select("""
            SELECT p.*, c.name AS category_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            WHERE p.id = #{id}
            """)
    Product selectById(Long id);

    /** 新增商品。 */
    @Insert("""
            INSERT INTO product(category_id, name, short_name, description, detail_description, price, image_path,
                                detail_image_path, sales_count, stock, status)
            VALUES(#{categoryId}, #{name}, #{shortName}, #{description}, #{detailDescription}, #{price}, #{imagePath},
                   #{detailImagePath}, #{salesCount}, #{stock}, #{status})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);

    /** 修改商品。 */
    @Update("""
            UPDATE product
            SET category_id = #{categoryId}, name = #{name}, short_name = #{shortName}, description = #{description},
                detail_description = #{detailDescription}, price = #{price}, image_path = #{imagePath},
                detail_image_path = #{detailImagePath}, sales_count = #{salesCount}, stock = #{stock},
                status = #{status}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Product product);

    /** 删除商品。 */
    @Delete("DELETE FROM product WHERE id = #{id}")
    int deleteById(Long id);

    /** 清空指定分类下商品分类。 */
    @Update("UPDATE product SET category_id = NULL, updated_at = NOW() WHERE category_id = #{categoryId}")
    int clearCategoryId(Long categoryId);

    /** 查询商品已关联的规格选项。 */
    @Select("""
            SELECT sg.code AS group_code, so.name AS option_name, so.price_delta
            FROM product_spec_option pso
            JOIN spec_option so ON pso.spec_option_id = so.id
            JOIN spec_group sg ON so.group_id = sg.id
            WHERE pso.product_id = #{productId}
            ORDER BY sg.sort_order ASC, so.sort_order ASC, so.id ASC
            """)
    List<ProductSpecOptionView> selectSpecOptionsByProductId(Long productId);

    /** 清空商品规格关联。 */
    @Delete("DELETE FROM product_spec_option WHERE product_id = #{productId}")
    int deleteSpecOptionsByProductId(Long productId);

    /** 按规格组和选项名称查询规格选项ID。 */
    @Select("""
            <script>
            SELECT so.id
            FROM spec_option so
            JOIN spec_group sg ON so.group_id = sg.id
            WHERE sg.code = #{groupCode}
              AND so.name IN
              <foreach collection="optionNames" item="name" open="(" separator="," close=")">
                #{name}
              </foreach>
            </script>
            """)
    List<Long> selectSpecOptionIds(@Param("groupCode") String groupCode,
                                   @Param("optionNames") List<String> optionNames);

    /** 新增商品规格关联。 */
    @Insert("INSERT INTO product_spec_option(product_id, spec_option_id) VALUES(#{productId}, #{specOptionId})")
    int insertSpecOption(@Param("productId") Long productId, @Param("specOptionId") Long specOptionId);
}