package com.Coffee.mapper;

import com.Coffee.entity.Category;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 分类数据访问层。
 */
public interface CategoryMapper {

    /** 查询全部分类。 */
    @Select("""
            SELECT c.*, COUNT(p.id) AS product_count
            FROM category c
            LEFT JOIN product p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY c.sort_order ASC, c.id ASC
            """)
    List<Category> selectAll();

    /** 分页查询分类。 */
    @Select("""
            <script>
            SELECT c.*, COUNT(p.id) AS product_count
            FROM category c
            LEFT JOIN product p ON c.id = p.category_id
            <where>
                <if test="keyword != null and keyword != ''">
                    AND c.name LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND c.status = #{status}
                </if>
            </where>
            GROUP BY c.id
            ORDER BY c.sort_order ASC, c.id ASC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Category> selectPage(@Param("keyword") String keyword,
                              @Param("status") Integer status,
                              @Param("offset") Integer offset,
                              @Param("pageSize") Integer pageSize);

    /** 统计分类数量。 */
    @Select("""
            <script>
            SELECT COUNT(*)
            FROM category c
            <where>
                <if test="keyword != null and keyword != ''">
                    AND c.name LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND c.status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("status") Integer status);

    /** 根据ID查询分类。 */
    @Select("SELECT * FROM category WHERE id = #{id}")
    Category selectById(Long id);

    /** 新增分类。 */
    @Insert("""
            INSERT INTO category(name, sort_order, status)
            VALUES(#{name}, #{sortOrder}, #{status})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Category category);

    /** 修改分类。 */
    @Update("""
            UPDATE category
            SET name = #{name}, sort_order = #{sortOrder}, status = #{status}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Category category);

    /** 删除分类。 */
    @Delete("DELETE FROM category WHERE id = #{id}")
    int deleteById(Long id);
}