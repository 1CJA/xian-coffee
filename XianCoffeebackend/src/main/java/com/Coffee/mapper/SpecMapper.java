package com.Coffee.mapper;

import com.Coffee.entity.SpecGroup;
import com.Coffee.entity.SpecOption;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 商品规格数据访问层。
 */
public interface SpecMapper {

    /** 查询规格组。 */
    @Select("SELECT * FROM spec_group ORDER BY sort_order ASC, id ASC")
    List<SpecGroup> selectGroups();

    /** 根据ID查询规格组。 */
    @Select("SELECT * FROM spec_group WHERE id = #{id}")
    SpecGroup selectGroupById(Long id);

    /** 查询规格组下选项。 */
    @Select("SELECT * FROM spec_option WHERE group_id = #{groupId} ORDER BY sort_order ASC, id ASC")
    List<SpecOption> selectOptionsByGroupId(Long groupId);

    /** 查询全部规格选项。 */
    @Select("""
            SELECT so.*, sg.name AS group_name
            FROM spec_option so
            LEFT JOIN spec_group sg ON so.group_id = sg.id
            ORDER BY sg.sort_order ASC, so.sort_order ASC, so.id ASC
            """)
    List<SpecOption> selectAllOptions();

    /** 新增规格组。 */
    @Insert("INSERT INTO spec_group(name, code, sort_order, status) VALUES(#{name}, #{code}, #{sortOrder}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertGroup(SpecGroup group);

    /** 修改规格组。 */
    @Update("UPDATE spec_group SET name = #{name}, code = #{code}, sort_order = #{sortOrder}, status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateGroup(SpecGroup group);

    /** 删除规格组。 */
    @Delete("DELETE FROM spec_group WHERE id = #{id}")
    int deleteGroup(Long id);

    /** 新增规格选项。 */
    @Insert("INSERT INTO spec_option(group_id, name, price_delta, sort_order, status) VALUES(#{groupId}, #{name}, #{priceDelta}, #{sortOrder}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertOption(SpecOption option);

    /** 修改规格选项。 */
    @Update("UPDATE spec_option SET group_id = #{groupId}, name = #{name}, price_delta = #{priceDelta}, sort_order = #{sortOrder}, status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateOption(SpecOption option);

    /** 删除规格选项。 */
    @Delete("DELETE FROM spec_option WHERE id = #{id}")
    int deleteOption(Long id);
}