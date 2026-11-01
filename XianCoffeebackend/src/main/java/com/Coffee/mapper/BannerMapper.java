package com.Coffee.mapper;

import com.Coffee.entity.Banner;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 轮播图数据访问层。
 */
public interface BannerMapper {

    /** 查询全部轮播图。 */
    @Select("SELECT * FROM banner ORDER BY sort_order ASC, id ASC")
    List<Banner> selectAll();

    /** 分页查询轮播图。 */
    @Select("""
            <script>
            SELECT * FROM banner
            <where>
                <if test="keyword != null and keyword != ''">
                    AND title LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            ORDER BY sort_order ASC, id ASC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Banner> selectPage(@Param("keyword") String keyword, @Param("status") Integer status,
                            @Param("offset") Integer offset, @Param("pageSize") Integer pageSize);

    /** 统计轮播图数量。 */
    @Select("""
            <script>
            SELECT COUNT(*) FROM banner
            <where>
                <if test="keyword != null and keyword != ''">
                    AND title LIKE CONCAT('%', #{keyword}, '%')
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("status") Integer status);

    /** 根据ID查询轮播图。 */
    @Select("SELECT * FROM banner WHERE id = #{id}")
    Banner selectById(Long id);

    /** 新增轮播图。 */
    @Insert("""
            INSERT INTO banner(title, image_path, link_type, link_value, sort_order, status)
            VALUES(#{title}, #{imagePath}, #{linkType}, #{linkValue}, #{sortOrder}, #{status})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Banner banner);

    /** 修改轮播图。 */
    @Update("""
            UPDATE banner
            SET title = #{title}, image_path = #{imagePath}, link_type = #{linkType}, link_value = #{linkValue},
                sort_order = #{sortOrder}, status = #{status}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Banner banner);

    /** 删除轮播图。 */
    @Delete("DELETE FROM banner WHERE id = #{id}")
    int deleteById(Long id);
}