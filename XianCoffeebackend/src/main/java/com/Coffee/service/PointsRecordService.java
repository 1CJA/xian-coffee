package com.Coffee.service;

import com.Coffee.entity.PointsRecord;
import com.Coffee.mapper.PointsRecordMapper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 积分记录业务层。
 */
@Service
public class PointsRecordService {

    private final PointsRecordMapper pointsRecordMapper;

    public PointsRecordService(PointsRecordMapper pointsRecordMapper) {
        this.pointsRecordMapper = pointsRecordMapper;
    }

    /** 查询会员积分记录。 */
    public List<PointsRecord> listByMemberId(Long memberId) {
        return pointsRecordMapper.selectByMemberId(memberId);
    }

    /** 新增积分记录。 */
    public PointsRecord create(PointsRecord record) {
        if (record.getMemberId() == null || record.getChangePoints() == null) {
            throw new RuntimeException("积分记录参数不完整");
        }
        pointsRecordMapper.insert(record);
        return record;
    }
}