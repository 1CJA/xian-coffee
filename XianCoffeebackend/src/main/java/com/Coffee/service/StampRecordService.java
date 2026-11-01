package com.Coffee.service;

import com.Coffee.entity.StampRecord;
import com.Coffee.entity.StampRule;
import com.Coffee.mapper.StampRecordMapper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 集点记录业务层。
 */
@Service
public class StampRecordService {

    private final StampRecordMapper stampRecordMapper;

    public StampRecordService(StampRecordMapper stampRecordMapper) {
        this.stampRecordMapper = stampRecordMapper;
    }

    /** 查询集点记录，memberId 为空时查询全部。 */
    public List<StampRecord> listByMemberId(Long memberId) {
        if (memberId == null) {
            return stampRecordMapper.selectAll();
        }
        return stampRecordMapper.selectByMemberId(memberId);
    }

    /** 查询集点规则。 */
    public List<StampRule> listRules() {
        return stampRecordMapper.selectRules();
    }

    /** 新增集点规则。 */
    public StampRule createRule(StampRule rule) {
        checkRule(rule);
        if (rule.getStatus() == null) {
            rule.setStatus(1);
        }
        if (rule.getValidDays() == null) {
            rule.setValidDays(30);
        }
        stampRecordMapper.insertRule(rule);
        return stampRecordMapper.selectRuleById(rule.getId());
    }

    /** 修改集点规则。 */
    public StampRule updateRule(StampRule rule) {
        if (rule.getId() == null || stampRecordMapper.selectRuleById(rule.getId()) == null) {
            throw new RuntimeException("集点规则不存在");
        }
        checkRule(rule);
        stampRecordMapper.updateRule(rule);
        return stampRecordMapper.selectRuleById(rule.getId());
    }

    /** 删除集点规则。 */
    public void deleteRule(Long id) {
        if (stampRecordMapper.selectRuleById(id) == null) {
            throw new RuntimeException("集点规则不存在");
        }
        stampRecordMapper.deleteRule(id);
    }

    /** 新增集点记录。 */
    public StampRecord create(StampRecord record) {
        if (record.getMemberId() == null || record.getChangeCount() == null) {
            throw new RuntimeException("集点记录参数不完整");
        }
        if (record.getRecordType() == null || record.getRecordType().isBlank()) {
            record.setRecordType("EXCHANGE_REWARD");
        }
        stampRecordMapper.insert(record);
        return record;
    }

    /** 校验集点规则。 */
    private void checkRule(StampRule rule) {
        if (rule.getName() == null || rule.getName().isBlank()) {
            throw new RuntimeException("集点规则名称不能为空");
        }
        if (rule.getTargetCount() == null || rule.getTargetCount() < 1) {
            throw new RuntimeException("集点目标必须大于0");
        }
    }
}