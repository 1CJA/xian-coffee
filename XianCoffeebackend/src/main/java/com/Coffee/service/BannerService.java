package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Banner;
import com.Coffee.mapper.BannerMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 轮播图业务层。
 */
@Service
public class BannerService {

    private final BannerMapper bannerMapper;
    private final ImageUrlUtil imageUrlUtil;

    public BannerService(BannerMapper bannerMapper, ImageUrlUtil imageUrlUtil) {
        this.bannerMapper = bannerMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 查询全部轮播图。 */
    public List<Banner> listAll() {
        List<Banner> banners = bannerMapper.selectAll();
        banners.forEach(this::fillImageUrl);
        return banners;
    }

    /** 分页查询轮播图。 */
    public PageResult<Banner> page(String keyword, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Banner> list = bannerMapper.selectPage(keyword, status, offset, safePageSize);
        list.forEach(this::fillImageUrl);
        return new PageResult<>(list, bannerMapper.countPage(keyword, status), safePage, safePageSize);
    }

    /** 根据ID查询轮播图。 */
    public Banner getById(Long id) {
        Banner banner = bannerMapper.selectById(id);
        if (banner == null) {
            throw new RuntimeException("轮播图不存在");
        }
        fillImageUrl(banner);
        return banner;
    }

    /** 新增轮播图。 */
    public Banner create(Banner banner) {
        checkBanner(banner);
        if (banner.getStatus() == null) {
            banner.setStatus(1);
        }
        if (banner.getSortOrder() == null) {
            banner.setSortOrder(0);
        }
        if (banner.getLinkType() == null) {
            banner.setLinkType("NONE");
        }
        bannerMapper.insert(banner);
        return getById(banner.getId());
    }

    /** 修改轮播图。 */
    public Banner update(Banner banner) {
        if (banner.getId() == null || bannerMapper.selectById(banner.getId()) == null) {
            throw new RuntimeException("轮播图不存在");
        }
        checkBanner(banner);
        bannerMapper.update(banner);
        return getById(banner.getId());
    }

    /** 删除轮播图。 */
    public void delete(Long id) {
        if (bannerMapper.selectById(id) == null) {
            throw new RuntimeException("轮播图不存在");
        }
        bannerMapper.deleteById(id);
    }

    /** 校验轮播图。 */
    private void checkBanner(Banner banner) {
        if (banner.getTitle() == null || banner.getTitle().isBlank()) {
            throw new RuntimeException("轮播图标题不能为空");
        }
        if (banner.getImagePath() == null || banner.getImagePath().isBlank()) {
            throw new RuntimeException("轮播图图片不能为空");
        }
    }

    /** 补充图片URL。 */
    private void fillImageUrl(Banner banner) {
        banner.setImageUrl(imageUrlUtil.buildUrl(banner.getImagePath()));
    }
}