package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.PointsRecord;
import com.Coffee.service.PointsRecordService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分记录接口控制器。
 */
@RestController
@RequestMapping("/api/points-records")
public class PointsRecordController {

    private final PointsRecordService pointsRecordService;

    public PointsRecordController(PointsRecordService pointsRecordService) {
        this.pointsRecordService = pointsRecordService;
    }

    /** 查询会员积分记录。 */
    @GetMapping
    public Result listByMemberId(@RequestParam Long memberId) {
        return Result.success(pointsRecordService.listByMemberId(memberId));
    }

    /** 新增积分记录。 */
    @PostMapping
    public Result create(@RequestBody PointsRecord record) {
        return Result.success(pointsRecordService.create(record));
    }
}