package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Store;
import com.Coffee.mapper.StoreMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 门店业务层。
 */
@Service
public class StoreService {

    private final StoreMapper storeMapper;
    private final ImageUrlUtil imageUrlUtil;

    public StoreService(StoreMapper storeMapper, ImageUrlUtil imageUrlUtil) {
        this.storeMapper = storeMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 查询全部门店。 */
    public List<Store> listAll() {
        List<Store> stores = storeMapper.selectAll();
        stores.forEach(this::fillUrl);
        return stores;
    }

    /** 分页查询门店。 */
    public PageResult<Store> page(String keyword, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Store> list = storeMapper.selectPage(keyword, status, offset, safePageSize);
        list.forEach(this::fillUrl);
        return new PageResult<>(list, storeMapper.countPage(keyword, status), safePage, safePageSize);
    }

    /** 根据ID查询门店。 */
    public Store getById(Long id) {
        Store store = storeMapper.selectById(id);
        if (store == null) {
            throw new RuntimeException("门店不存在");
        }
        fillUrl(store);
        return store;
    }

    /** 新增门店。 */
    public Store create(Store store) {
        checkStore(store);
        if (store.getStatus() == null) {
            store.setStatus(1);
        }
        storeMapper.insert(store);
        return getById(store.getId());
    }

    /** 修改门店。 */
    public Store update(Store store) {
        if (store.getId() == null || storeMapper.selectById(store.getId()) == null) {
            throw new RuntimeException("门店不存在");
        }
        checkStore(store);
        storeMapper.update(store);
        return getById(store.getId());
    }

    /** 删除门店。 */
    public void delete(Long id) {
        if (storeMapper.selectById(id) == null) {
            throw new RuntimeException("门店不存在");
        }
        storeMapper.deleteById(id);
    }

    /** 校验门店。 */
    private void checkStore(Store store) {
        if (store.getName() == null || store.getName().isBlank()) {
            throw new RuntimeException("门店名称不能为空");
        }
        if (store.getAddress() == null || store.getAddress().isBlank()) {
            throw new RuntimeException("门店地址不能为空");
        }
    }

    /** 补充图片和视频URL。 */
    private void fillUrl(Store store) {
        store.setImageUrl(imageUrlUtil.buildUrl(store.getImagePath()));
        store.setVideoUrl(imageUrlUtil.buildUrl(store.getVideoPath()));
    }
}