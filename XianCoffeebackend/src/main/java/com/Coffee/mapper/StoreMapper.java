package com.Coffee.mapper;

import com.Coffee.entity.Store;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 门店数据访问层。
 */
public interface StoreMapper {

    /** 查询全部门店。 */
    @Select("SELECT * FROM store ORDER BY created_at DESC")
    List<Store> selectAll();

    /** 分页查询门店。 */
    @Select("""
            <script>
            SELECT * FROM store
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (name LIKE CONCAT('%', #{keyword}, '%') OR address LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            ORDER BY created_at DESC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Store> selectPage(@Param("keyword") String keyword, @Param("status") Integer status,
                           @Param("offset") Integer offset, @Param("pageSize") Integer pageSize);

    /** 统计门店数量。 */
    @Select("""
            <script>
            SELECT COUNT(*) FROM store
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (name LIKE CONCAT('%', #{keyword}, '%') OR address LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("status") Integer status);

    /** 根据ID查询门店。 */
    @Select("SELECT * FROM store WHERE id = #{id}")
    Store selectById(Long id);

    /** 新增门店。 */
    @Insert("""
            INSERT INTO store(name, phone, address, business_hours, image_path, video_path, status)
            VALUES(#{name}, #{phone}, #{address}, #{businessHours}, #{imagePath}, #{videoPath}, #{status})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Store store);

    /** 修改门店。 */
    @Update("""
            UPDATE store
            SET name = #{name}, phone = #{phone}, address = #{address}, business_hours = #{businessHours},
                image_path = #{imagePath}, video_path = #{videoPath}, status = #{status}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Store store);

    /** 删除门店。 */
    @Delete("DELETE FROM store WHERE id = #{id}")
    int deleteById(Long id);
}