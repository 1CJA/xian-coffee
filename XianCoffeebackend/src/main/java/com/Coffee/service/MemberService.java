package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Member;
import com.Coffee.entity.MemberCoupon;
import com.Coffee.entity.StampRecord;
import com.Coffee.mapper.MemberCouponMapper;
import com.Coffee.mapper.MemberMapper;
import com.Coffee.mapper.StampRecordMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.util.List;

/**
 * 会员业务层。
 */
@Service
public class MemberService {

    private static final Long STAMP_REWARD_COUPON_ID = 3L;
    private static final Long DEFAULT_COUPON_ID = 1L;

    private final MemberMapper memberMapper;
    private final MemberCouponMapper memberCouponMapper;
    private final StampRecordMapper stampRecordMapper;
    private final ImageUrlUtil imageUrlUtil;

    public MemberService(MemberMapper memberMapper, MemberCouponMapper memberCouponMapper, StampRecordMapper stampRecordMapper, ImageUrlUtil imageUrlUtil) {
        this.memberMapper = memberMapper;
        this.memberCouponMapper = memberCouponMapper;
        this.stampRecordMapper = stampRecordMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 查询全部会员。 */
    public List<Member> listAll() {
        List<Member> members = memberMapper.selectAll();
        members.forEach(this::fillMemberInfo);
        return members;
    }

    /** 分页查询会员。 */
    public PageResult<Member> page(String keyword, Integer status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Member> list = memberMapper.selectPage(keyword, status, offset, safePageSize);
        list.forEach(this::fillMemberInfo);
        return new PageResult<>(list, memberMapper.countPage(keyword, status), safePage, safePageSize);
    }

    /** 根据ID查询会员。 */
    public Member getById(Long id) {
        Member member = memberMapper.selectById(id);
        if (member == null) {
            throw new RuntimeException("会员不存在");
        }
        fillMemberInfo(member);
        return member;
    }

    /** 查询会员优惠券。 */
    public List<MemberCoupon> listCoupons(Long memberId) {
        return memberCouponMapper.selectByMemberId(memberId);
    }

    /** 新增会员。 */
    public Member create(Member member) {
        checkMember(member);
        if (member.getLevelName() == null) {
            member.setLevelName("普通会员");
        }
        if (member.getPoints() == null) {
            member.setPoints(0);
        }
        if (member.getBalance() == null) {
            member.setBalance(BigDecimal.ZERO);
        }
        if (member.getStampCount() == null) {
            member.setStampCount(0);
        }
        if (member.getStampExchangeCount() == null) {
            member.setStampExchangeCount(0);
        }
        if (member.getStatus() == null) {
            member.setStatus(1);
        }
        memberMapper.insert(member);
        syncCouponCount(member.getId(), member.getCoupons());
        return getById(member.getId());
    }
    /** 修改会员。 */
    public Member update(Member member) {
        if (member.getId() == null || memberMapper.selectById(member.getId()) == null) {
            throw new RuntimeException("会员不存在");
        }
        checkMember(member);
        if (member.getBalance() == null) {
            member.setBalance(BigDecimal.ZERO);
        }
        memberMapper.update(member);
        syncCouponCount(member.getId(), member.getCoupons());
        return getById(member.getId());
    }
    /** 禁用会员。 */
    /** 兑换集点奖励。 */
    @Transactional(rollbackFor = Exception.class)
    public Member redeemStamp(Long id) {
        Member member = memberMapper.selectById(id);
        if (member == null) {
            throw new RuntimeException("会员不存在");
        }
        int stampCount = member.getStampCount() == null ? 0 : member.getStampCount();
        if (stampCount < 10) {
            throw new RuntimeException("集点未满10点，不能兑换");
        }
        int updated = memberMapper.redeemStamp(id);
        if (updated == 0) {
            throw new RuntimeException("集点未满10点，不能兑换");
        }

        StampRecord record = new StampRecord();
        record.setMemberId(id);
        record.setChangeCount(-10);
        record.setRecordType("EXCHANGE_REWARD");
        record.setExchangeCouponId(STAMP_REWARD_COUPON_ID);
        record.setRemark("后台兑换饮品免单券，集点清零");
        stampRecordMapper.insert(record);

        MemberCoupon rewardCoupon = new MemberCoupon();
        rewardCoupon.setMemberId(id);
        rewardCoupon.setCouponId(STAMP_REWARD_COUPON_ID);
        rewardCoupon.setStatus("UNUSED");
        memberCouponMapper.insert(rewardCoupon);

        return getById(id);
    }
    public void disable(Long id) {
        if (memberMapper.selectById(id) == null) {
            throw new RuntimeException("会员不存在");
        }
        memberMapper.disableById(id);
    }


    /** 同步后台设置的可用优惠券数量。 */
    private void syncCouponCount(Long memberId, Integer targetCount) {
        if (memberId == null || targetCount == null) {
            return;
        }
        int safeTarget = Math.max(0, targetCount);
        int current = memberCouponMapper.countUnusedByMemberId(memberId);
        if (safeTarget > current) {
            for (int i = current; i < safeTarget; i++) {
                MemberCoupon coupon = new MemberCoupon();
                coupon.setMemberId(memberId);
                coupon.setCouponId(DEFAULT_COUPON_ID);
                coupon.setStatus("UNUSED");
                memberCouponMapper.insert(coupon);
            }
        } else if (safeTarget < current) {
            memberCouponMapper.deleteLatestUnused(memberId, current - safeTarget);
        }
    }
    /** 校验会员。 */
    private void checkMember(Member member) {
        if (member.getNickname() == null || member.getNickname().isBlank()) {
            throw new RuntimeException("会员昵称不能为空");
        }
        if (member.getPhone() == null || member.getPhone().isBlank()) {
            throw new RuntimeException("手机号不能为空");
        }
    }

    /** 补充头像URL。 */
    /** 补充头像和优惠券信息。 */
    private void fillMemberInfo(Member member) {
        fillAvatarUrl(member);
        List<MemberCoupon> coupons = memberCouponMapper.selectByMemberId(member.getId());
        member.setCouponList(coupons);
        member.setCoupons(memberCouponMapper.countUnusedByMemberId(member.getId()));
    }
    private void fillAvatarUrl(Member member) {
        member.setAvatarUrl(imageUrlUtil.buildUrl(member.getAvatarUrl()));
    }
}