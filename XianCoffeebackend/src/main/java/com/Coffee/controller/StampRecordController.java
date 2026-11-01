package com.Coffee.controller;

import com.Coffee.common.Result;
import com.Coffee.entity.StampRecord;
import com.Coffee.entity.StampRule;
import com.Coffee.service.StampRecordService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 集点记录接口控制器。
 */
@RestController
@RequestMapping("/api/stamp-records")
public class StampRecordController {

    private final StampRecordService stampRecordService;

    public StampRecordController(StampRecordService stampRecordService) {
        this.stampRecordService = stampRecordService;
    }

    /** 查询集点记录。 */
    @GetMapping
    public Result listByMemberId(@RequestParam(required = false) Long memberId) {
        return Result.success(stampRecordService.listByMemberId(memberId));
    }

    /** 查询集点规则。 */
    @GetMapping("/rules")
    public Result listRules() {
        return Result.success(stampRecordService.listRules());
    }

    /** 新增集点规则。 */
    @PostMapping("/rules")
    public Result createRule(@RequestBody StampRule rule) {
        return Result.success(stampRecordService.createRule(rule));
    }

    /** 修改集点规则。 */
    @PutMapping("/rules")
    public Result updateRule(@RequestBody StampRule rule) {
        return Result.success(stampRecordService.updateRule(rule));
    }

    /** 删除集点规则。 */
    @DeleteMapping("/rules/{id}")
    public Result deleteRule(@PathVariable Long id) {
        stampRecordService.deleteRule(id);
        return Result.success();
    }

    /** 新增集点记录。 */
    @PostMapping
    public Result create(@RequestBody StampRecord record) {
        return Result.success(stampRecordService.create(record));
    }
}