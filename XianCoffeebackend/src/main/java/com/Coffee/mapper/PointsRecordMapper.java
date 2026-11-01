package com.Coffee.mapper;

import com.Coffee.entity.PointsRecord;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 积分记录数据访问层。
 */
public interface PointsRecordMapper {

    /** 查询会员积分记录。 */
    @Select("SELECT * FROM points_record WHERE member_id = #{memberId} ORDER BY created_at DESC")
    List<PointsRecord> selectByMemberId(Long memberId);

    /** 新增积分记录。 */
    @Insert("INSERT INTO points_record(member_id, order_id, change_points, record_type, remark) VALUES(#{memberId}, #{orderId}, #{changePoints}, #{recordType}, #{remark})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(PointsRecord record);
}