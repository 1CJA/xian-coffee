package com.Coffee.service;

import com.Coffee.entity.Address;
import com.Coffee.mapper.AddressMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 地址业务层。
 */
@Service
public class AddressService {

    private final AddressMapper addressMapper;

    public AddressService(AddressMapper addressMapper) {
        this.addressMapper = addressMapper;
    }

    /** 查询会员地址。 */
    public List<Address> listByMemberId(Long memberId) {
        return addressMapper.selectByMemberId(memberId);
    }

    /** 根据ID查询地址。 */
    public Address getById(Long id) {
        Address address = addressMapper.selectById(id);
        if (address == null) {
            throw new RuntimeException("地址不存在");
        }
        return address;
    }

    /** 新增地址。 */
    @Transactional(rollbackFor = Exception.class)
    public Address create(Address address) {
        checkAddress(address);
        if (address.getIsDefault() == null) {
            address.setIsDefault(0);
        }
        if (address.getIsDefault() == 1) {
            addressMapper.clearDefault(address.getMemberId());
        }
        addressMapper.insert(address);
        return getById(address.getId());
    }

    /** 修改地址。 */
    @Transactional(rollbackFor = Exception.class)
    public Address update(Address address) {
        if (address.getId() == null || addressMapper.selectById(address.getId()) == null) {
            throw new RuntimeException("地址不存在");
        }
        checkAddress(address);
        if (address.getIsDefault() != null && address.getIsDefault() == 1) {
            addressMapper.clearDefault(address.getMemberId());
        }
        addressMapper.update(address);
        return getById(address.getId());
    }

    /** 删除地址。 */
    public void delete(Long id) {
        if (addressMapper.selectById(id) == null) {
            throw new RuntimeException("地址不存在");
        }
        addressMapper.deleteById(id);
    }

    /** 校验地址。 */
    private void checkAddress(Address address) {
        if (address.getMemberId() == null) {
            throw new RuntimeException("会员ID不能为空");
        }
        if (address.getReceiverName() == null || address.getReceiverName().isBlank()) {
            throw new RuntimeException("收货人不能为空");
        }
        if (address.getReceiverPhone() == null || address.getReceiverPhone().isBlank()) {
            throw new RuntimeException("手机号不能为空");
        }
        if (address.getDetail() == null || address.getDetail().isBlank()) {
            throw new RuntimeException("详细地址不能为空");
        }
    }
}