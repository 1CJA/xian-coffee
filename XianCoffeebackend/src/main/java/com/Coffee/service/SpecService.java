package com.Coffee.service;

import com.Coffee.entity.SpecGroup;
import com.Coffee.entity.SpecOption;
import com.Coffee.mapper.SpecMapper;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品规格业务层。
 */
@Service
public class SpecService {

    private final SpecMapper specMapper;

    public SpecService(SpecMapper specMapper) {
        this.specMapper = specMapper;
    }

    /** 查询规格组和选项。 */
    public List<SpecGroup> listGroups() {
        List<SpecGroup> groups = specMapper.selectGroups();
        groups.forEach(group -> group.setOptions(specMapper.selectOptionsByGroupId(group.getId())));
        return groups;
    }

    /** 查询全部规格选项。 */
    public List<SpecOption> listOptions() {
        return specMapper.selectAllOptions();
    }

    /** 新增规格组。 */
    public SpecGroup createGroup(SpecGroup group) {
        checkGroup(group);
        if (group.getSortOrder() == null) {
            group.setSortOrder(0);
        }
        if (group.getStatus() == null) {
            group.setStatus(1);
        }
        specMapper.insertGroup(group);
        return specMapper.selectGroupById(group.getId());
    }

    /** 修改规格组。 */
    public SpecGroup updateGroup(SpecGroup group) {
        if (group.getId() == null || specMapper.selectGroupById(group.getId()) == null) {
            throw new RuntimeException("规格组不存在");
        }
        checkGroup(group);
        specMapper.updateGroup(group);
        return specMapper.selectGroupById(group.getId());
    }

    /** 删除规格组。 */
    public void deleteGroup(Long id) {
        List<SpecOption> options = specMapper.selectOptionsByGroupId(id);
        if (!options.isEmpty()) {
            throw new RuntimeException("请先删除规格组选项");
        }
        specMapper.deleteGroup(id);
    }

    /** 新增规格选项。 */
    public SpecOption createOption(SpecOption option) {
        checkOption(option);
        if (option.getSortOrder() == null) {
            option.setSortOrder(0);
        }
        if (option.getStatus() == null) {
            option.setStatus(1);
        }
        specMapper.insertOption(option);
        return option;
    }

    /** 修改规格选项。 */
    public SpecOption updateOption(SpecOption option) {
        if (option.getId() == null) {
            throw new RuntimeException("规格选项ID不能为空");
        }
        checkOption(option);
        specMapper.updateOption(option);
        return option;
    }

    /** 删除规格选项。 */
    public void deleteOption(Long id) {
        specMapper.deleteOption(id);
    }

    /** 校验规格组。 */
    private void checkGroup(SpecGroup group) {
        if (group.getName() == null || group.getName().isBlank()) {
            throw new RuntimeException("规格组名称不能为空");
        }
        if (group.getCode() == null || group.getCode().isBlank()) {
            throw new RuntimeException("规格组编码不能为空");
        }
    }

    /** 校验规格选项。 */
    private void checkOption(SpecOption option) {
        if (option.getGroupId() == null) {
            throw new RuntimeException("规格组ID不能为空");
        }
        if (option.getName() == null || option.getName().isBlank()) {
            throw new RuntimeException("规格选项名称不能为空");
        }
    }
}