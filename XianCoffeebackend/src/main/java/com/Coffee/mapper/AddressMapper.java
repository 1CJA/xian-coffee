package com.Coffee.mapper;

import com.Coffee.entity.Address;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 地址数据访问层。
 */
public interface AddressMapper {

    /** 查询会员地址。 */
    @Select("SELECT * FROM address WHERE member_id = #{memberId} ORDER BY is_default DESC, created_at DESC")
    List<Address> selectByMemberId(Long memberId);

    /** 根据ID查询地址。 */
    @Select("SELECT * FROM address WHERE id = #{id}")
    Address selectById(Long id);

    /** 新增地址。 */
    @Insert("""
            INSERT INTO address(member_id, receiver_name, receiver_phone, province, city, district, detail, is_default)
            VALUES(#{memberId}, #{receiverName}, #{receiverPhone}, #{province}, #{city}, #{district}, #{detail}, #{isDefault})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Address address);

    /** 修改地址。 */
    @Update("""
            UPDATE address
            SET receiver_name = #{receiverName}, receiver_phone = #{receiverPhone}, province = #{province}, city = #{city},
                district = #{district}, detail = #{detail}, is_default = #{isDefault}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Address address);

    /** 清空默认地址。 */
    @Update("UPDATE address SET is_default = 0, updated_at = NOW() WHERE member_id = #{memberId}")
    int clearDefault(Long memberId);

    /** 删除地址。 */
    @Delete("DELETE FROM address WHERE id = #{id}")
    int deleteById(Long id);
}