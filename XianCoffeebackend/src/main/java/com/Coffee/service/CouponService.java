package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Coupon;
import com.Coffee.mapper.CouponMapper;
import com.Coffee.mapper.MemberCouponMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 优惠券业务层。
 */
@Service
public class CouponService {

    private final CouponMapper couponMapper;
    private final MemberCouponMapper memberCouponMapper;
    private final ImageUrlUtil imageUrlUtil;

    public CouponService(CouponMapper couponMapper, MemberCouponMapper memberCouponMapper, ImageUrlUtil imageUrlUtil) {
        this.couponMapper = couponMapper;
        this.memberCouponMapper = memberCouponMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 查询全部优惠券。 */
    public List<Coupon> listAll() {
        List<Coupon> coupons = couponMapper.selectAll();
        coupons.forEach(this::fillImageUrl);
        return coupons;
    }

    /** 分页查询优惠券。 */
    public PageResult<Coupon> page(String keyword, String type, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Coupon> list = couponMapper.selectPage(keyword, type, status, offset, safePageSize);
        list.forEach(this::fillImageUrl);
        return new PageResult<>(list, couponMapper.countPage(keyword, type, status), safePage, safePageSize);
    }

    /** 根据ID查询优惠券。 */
    public Coupon getById(Long id) {
        Coupon coupon = couponMapper.selectById(id);
        if (coupon == null) {
            throw new RuntimeException("优惠券不存在");
        }
        fillImageUrl(coupon);
        return coupon;
    }

    /** 新增优惠券。 */
    public Coupon create(Coupon coupon) {
        checkCoupon(coupon);
        if (coupon.getAmount() == null) {
            coupon.setAmount(BigDecimal.ZERO);
        }
        if (coupon.getMinAmount() == null) {
            coupon.setMinAmount(BigDecimal.ZERO);
        }
        if (coupon.getTotalCount() == null) {
            coupon.setTotalCount(0);
        }
        if (coupon.getStatus() == null) {
            coupon.setStatus(1);
        }
        couponMapper.insert(coupon);
        return getById(coupon.getId());
    }

    /** 修改优惠券。 */
    public Coupon update(Coupon coupon) {
        if (coupon.getId() == null || couponMapper.selectById(coupon.getId()) == null) {
            throw new RuntimeException("优惠券不存在");
        }
        checkCoupon(coupon);
        couponMapper.update(coupon);
        return getById(coupon.getId());
    }

    /** 删除优惠券。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        if (couponMapper.selectById(id) == null) {
            throw new RuntimeException("优惠券不存在");
        }
        memberCouponMapper.deleteByCouponId(id);
        couponMapper.deleteById(id);
    }

    /** 校验优惠券。 */
    private void checkCoupon(Coupon coupon) {
        if (coupon.getName() == null || coupon.getName().isBlank()) {
            throw new RuntimeException("优惠券名称不能为空");
        }
        if (coupon.getType() == null || coupon.getType().isBlank()) {
            throw new RuntimeException("优惠券类型不能为空");
        }
    }

    /** 补充图片URL。 */
    private void fillImageUrl(Coupon coupon) {
        coupon.setImageUrl(imageUrlUtil.buildUrl(coupon.getImagePath()));
    }
}