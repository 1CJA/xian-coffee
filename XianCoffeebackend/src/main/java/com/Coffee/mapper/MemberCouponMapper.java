package com.Coffee.mapper;

import com.Coffee.entity.MemberCoupon;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 会员优惠券数据访问层。
 */
public interface MemberCouponMapper {

    /** 查询会员优惠券。 */
    @Select("SELECT * FROM member_coupon WHERE member_id = #{memberId} ORDER BY received_at DESC")
    List<MemberCoupon> selectByMemberId(Long memberId);


    /** 统计会员可用优惠券数量。 */
    @Select("SELECT COUNT(*) FROM member_coupon WHERE member_id = #{memberId} AND status = 'UNUSED'")
    int countUnusedByMemberId(Long memberId);

    /** 删除最近发放的可用优惠券。 */
    @Delete("""
            DELETE FROM member_coupon
            WHERE id IN (
                SELECT id FROM (
                    SELECT id FROM member_coupon
                    WHERE member_id = #{memberId} AND status = 'UNUSED'
                    ORDER BY id DESC
                    LIMIT #{limit}
                ) temp_coupon
            )
            """)
    int deleteLatestUnused(@Param("memberId") Long memberId, @Param("limit") Integer limit);
    /** 发放优惠券。 */
    @Insert("INSERT INTO member_coupon(member_id, coupon_id, status) VALUES(#{memberId}, #{couponId}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(MemberCoupon memberCoupon);

    /** 标记优惠券未使用。 */
    @Update("UPDATE member_coupon SET status = 'UNUSED', used_at = NULL, order_id = NULL, updated_at = NOW() WHERE id = #{id}")
    int markUnused(Long id);

    /** 删除某优惠券发放记录。 */
    @Delete("DELETE FROM member_coupon WHERE coupon_id = #{couponId}")
    int deleteByCouponId(Long couponId);
}