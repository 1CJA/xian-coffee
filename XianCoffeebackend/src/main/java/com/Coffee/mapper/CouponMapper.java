package com.Coffee.mapper;

import com.Coffee.entity.Coupon;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 优惠券数据访问层。
 */
public interface CouponMapper {

    /** 查询全部优惠券。 */
    @Select("SELECT * FROM coupon ORDER BY created_at DESC")
    List<Coupon> selectAll();

    /** 分页查询优惠券。 */
    @Select("""
            <script>
            SELECT * FROM coupon
            <where>
                <if test="keyword != null and keyword != ''">
                    AND name LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
                <if test="type != null and type != ''">
                    AND type = #{type}
                </if>
            </where>
            ORDER BY created_at DESC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Coupon> selectPage(@Param("keyword") String keyword, @Param("type") String type,
                            @Param("status") Integer status, @Param("offset") Integer offset,
                            @Param("pageSize") Integer pageSize);

    /** 统计优惠券数量。 */
    @Select("""
            <script>
            SELECT COUNT(*) FROM coupon
            <where>
                <if test="keyword != null and keyword != ''">
                    AND name LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
                <if test="type != null and type != ''">
                    AND type = #{type}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("type") String type, @Param("status") Integer status);

    /** 根据ID查询优惠券。 */
    @Select("SELECT * FROM coupon WHERE id = #{id}")
    Coupon selectById(Long id);

    /** 新增优惠券。 */
    @Insert("""
            INSERT INTO coupon(name, type, amount, min_amount, image_path, start_date, end_date, total_count, status, rule_text)
            VALUES(#{name}, #{type}, #{amount}, #{minAmount}, #{imagePath}, #{startDate}, #{endDate}, #{totalCount}, #{status}, #{ruleText})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Coupon coupon);

    /** 修改优惠券。 */
    @Update("""
            UPDATE coupon
            SET name = #{name}, type = #{type}, amount = #{amount}, min_amount = #{minAmount}, image_path = #{imagePath},
                start_date = #{startDate}, end_date = #{endDate}, total_count = #{totalCount}, status = #{status},
                rule_text = #{ruleText}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Coupon coupon);

    /** 删除优惠券。 */
    @Delete("DELETE FROM coupon WHERE id = #{id}")
    int deleteById(Long id);
}