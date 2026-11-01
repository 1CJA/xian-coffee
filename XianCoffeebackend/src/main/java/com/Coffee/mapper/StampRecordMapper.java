package com.Coffee.mapper;

import com.Coffee.entity.StampRecord;
import com.Coffee.entity.StampRule;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 集点记录数据访问层。
 */
public interface StampRecordMapper {

    /** 查询全部集点记录。 */
    @Select("""
            SELECT sr.*, m.nickname AS member_name, m.phone, m.avatar_url
            FROM stamp_record sr
            LEFT JOIN member m ON sr.member_id = m.id
            ORDER BY sr.created_at DESC
            """)
    List<StampRecord> selectAll();

    /** 查询会员集点记录。 */
    @Select("""
            SELECT sr.*, m.nickname AS member_name, m.phone, m.avatar_url
            FROM stamp_record sr
            LEFT JOIN member m ON sr.member_id = m.id
            WHERE sr.member_id = #{memberId}
            ORDER BY sr.created_at DESC
            """)
    List<StampRecord> selectByMemberId(Long memberId);

    /** 查询集点规则。 */
    @Select("SELECT * FROM stamp_rule ORDER BY id ASC")
    List<StampRule> selectRules();

    /** 根据ID查询集点规则。 */
    @Select("SELECT * FROM stamp_rule WHERE id = #{id}")
    StampRule selectRuleById(Long id);

    /** 新增集点规则。 */
    @Insert("INSERT INTO stamp_rule(name, target_count, reward_coupon_id, valid_days, status) VALUES(#{name}, #{targetCount}, #{rewardCouponId}, #{validDays}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertRule(StampRule rule);

    /** 修改集点规则。 */
    @Update("UPDATE stamp_rule SET name = #{name}, target_count = #{targetCount}, reward_coupon_id = #{rewardCouponId}, valid_days = #{validDays}, status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateRule(StampRule rule);

    /** 删除集点规则。 */
    @Delete("DELETE FROM stamp_rule WHERE id = #{id}")
    int deleteRule(Long id);

    /** 新增集点记录。 */
    @Insert("INSERT INTO stamp_record(member_id, order_id, change_count, record_type, exchange_coupon_id, remark) VALUES(#{memberId}, #{orderId}, #{changeCount}, #{recordType}, #{exchangeCouponId}, #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(StampRecord record);
}