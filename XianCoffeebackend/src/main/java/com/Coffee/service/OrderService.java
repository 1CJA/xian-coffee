package com.Coffee.service;

import com.Coffee.common.PageResult;
import com.Coffee.entity.Member;
import com.Coffee.entity.MemberCoupon;
import com.Coffee.entity.Order;
import com.Coffee.entity.OrderItem;
import com.Coffee.entity.PointsRecord;
import com.Coffee.entity.StampRecord;
import com.Coffee.mapper.MemberCouponMapper;
import com.Coffee.mapper.MemberMapper;
import com.Coffee.mapper.OrderMapper;
import com.Coffee.mapper.PointsRecordMapper;
import com.Coffee.mapper.StampRecordMapper;
import com.Coffee.util.ImageUrlUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * 订单业务层。
 */
@Service
public class OrderService {

    private static final Long STAMP_REWARD_COUPON_ID = 3L;

    private final OrderMapper orderMapper;
    private final MemberMapper memberMapper;
    private final MemberCouponMapper memberCouponMapper;
    private final PointsRecordMapper pointsRecordMapper;
    private final StampRecordMapper stampRecordMapper;
    private final ImageUrlUtil imageUrlUtil;

    public OrderService(OrderMapper orderMapper, MemberMapper memberMapper, MemberCouponMapper memberCouponMapper,
                        PointsRecordMapper pointsRecordMapper, StampRecordMapper stampRecordMapper,
                        ImageUrlUtil imageUrlUtil) {
        this.orderMapper = orderMapper;
        this.memberMapper = memberMapper;
        this.memberCouponMapper = memberCouponMapper;
        this.pointsRecordMapper = pointsRecordMapper;
        this.stampRecordMapper = stampRecordMapper;
        this.imageUrlUtil = imageUrlUtil;
    }

    /** 分页查询订单。 */
    public PageResult<Order> page(String keyword, String status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        int offset = (safePage - 1) * safePageSize;
        List<Order> list = orderMapper.selectPage(keyword, status, offset, safePageSize);
        list.forEach(this::fillOrderItems);
        return new PageResult<>(list, orderMapper.countPage(keyword, status), safePage, safePageSize);
    }

    /** 根据ID查询订单。 */
    public Order getById(Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        fillOrderItems(order);
        return order;
    }

    /** 新增订单。 */
    @Transactional(rollbackFor = Exception.class)
    public Order create(Order order) {
        checkOrder(order);
        if (order.getOrderNo() == null || order.getOrderNo().isBlank()) {
            order.setOrderNo(generateOrderNo());
        }
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("PENDING_PAYMENT");
        }
        if (order.getOrderType() == null || order.getOrderType().isBlank()) {
            order.setOrderType("PICKUP");
        }
        if (order.getCouponAmount() == null) {
            order.setCouponAmount(BigDecimal.ZERO);
        }
        if (order.getPointsAmount() == null) {
            order.setPointsAmount(BigDecimal.ZERO);
        }
        if (order.getUsePoints() == null) {
            order.setUsePoints(0);
        }
        if (order.getPickupCode() == null || order.getPickupCode().isBlank()) {
            order.setPickupCode(generatePickupCode());
        }
        orderMapper.insert(order);
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrderId(order.getId());
                orderMapper.insertItem(item);
            }
        }
        return getById(order.getId());
    }

    /** 支付订单。 */
    @Transactional(rollbackFor = Exception.class)
    public Order pay(Long id) {
        Order order = getById(id);
        if ("PAID".equals(order.getStatus())) {
            return order;
        }
        orderMapper.markPaid(id);
        int gainPoints = order.getPayAmount() == null ? 0 : order.getPayAmount().intValue();
        if (gainPoints > 0) {
            memberMapper.addPoints(order.getMemberId(), gainPoints);
            PointsRecord record = new PointsRecord();
            record.setMemberId(order.getMemberId());
            record.setOrderId(order.getId());
            record.setChangePoints(gainPoints);
            record.setRecordType("ORDER_GAIN");
            record.setRemark("订单支付获得积分");
            pointsRecordMapper.insert(record);
        }
        addStampAfterPay(order);
        return getById(id);
    }

    /** 取消订单并返还权益。 */
    @Transactional(rollbackFor = Exception.class)
    public Order cancel(Long id, String reason) {
        Order order = getById(id);
        if ("CANCELLED".equals(order.getStatus())) {
            return order;
        }
        if (order.getMemberCouponId() != null) {
            memberCouponMapper.markUnused(order.getMemberCouponId());
        }
        if (order.getUsePoints() != null && order.getUsePoints() > 0) {
            memberMapper.addPoints(order.getMemberId(), order.getUsePoints());
            PointsRecord record = new PointsRecord();
            record.setMemberId(order.getMemberId());
            record.setOrderId(order.getId());
            record.setChangePoints(order.getUsePoints());
            record.setRecordType("REFUND_RETURN");
            record.setRemark("订单取消返还积分");
            pointsRecordMapper.insert(record);
        }
        orderMapper.cancel(id, reason == null || reason.isBlank() ? "用户或管理员取消订单" : reason);
        return getById(id);
    }

    /** 修改订单状态。 */
    public Order updateStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new RuntimeException("订单状态不能为空");
        }
        if (orderMapper.selectById(id) == null) {
            throw new RuntimeException("订单不存在");
        }
        orderMapper.updateStatus(id, status);
        return getById(id);
    }

    /** 删除订单。 */
    public void delete(Long id) {
        if (orderMapper.selectById(id) == null) {
            throw new RuntimeException("订单不存在");
        }
        orderMapper.deleteById(id);
    }

    /** 支付后增加集点，满10点发放免单券。 */
    private void addStampAfterPay(Order order) {
        Member member = memberMapper.selectById(order.getMemberId());
        if (member == null) {
            return;
        }
        int nextStamp = (member.getStampCount() == null ? 0 : member.getStampCount()) + 1;
        StampRecord gainRecord = new StampRecord();
        gainRecord.setMemberId(order.getMemberId());
        gainRecord.setOrderId(order.getId());
        gainRecord.setChangeCount(1);
        gainRecord.setRecordType("ORDER_GAIN");
        gainRecord.setRemark("订单支付获得1个集点");
        stampRecordMapper.insert(gainRecord);

        if (nextStamp >= 10) {
            memberMapper.updateStamp(order.getMemberId(), 0, 1);
            StampRecord exchangeRecord = new StampRecord();
            exchangeRecord.setMemberId(order.getMemberId());
            exchangeRecord.setOrderId(order.getId());
            exchangeRecord.setChangeCount(-10);
            exchangeRecord.setRecordType("EXCHANGE_REWARD");
            exchangeRecord.setExchangeCouponId(STAMP_REWARD_COUPON_ID);
            exchangeRecord.setRemark("集满10点兑换饮品免单券");
            stampRecordMapper.insert(exchangeRecord);

            MemberCoupon rewardCoupon = new MemberCoupon();
            rewardCoupon.setMemberId(order.getMemberId());
            rewardCoupon.setCouponId(STAMP_REWARD_COUPON_ID);
            rewardCoupon.setStatus("UNUSED");
            memberCouponMapper.insert(rewardCoupon);
        } else {
            memberMapper.updateStamp(order.getMemberId(), nextStamp, 0);
        }
    }

    /** 校验订单。 */
    private void checkOrder(Order order) {
        if (order.getMemberId() == null) {
            throw new RuntimeException("会员ID不能为空");
        }
        if (order.getTotalAmount() == null || order.getPayAmount() == null) {
            throw new RuntimeException("订单金额不能为空");
        }
    }

    /** 查询并补充订单明细。 */
    private void fillOrderItems(Order order) {
        List<OrderItem> items = orderMapper.selectItemsByOrderId(order.getId());
        items.forEach(item -> item.setProductImageUrl(imageUrlUtil.buildUrl(item.getProductImagePath())));
        order.setOrderItems(items);
    }

    /** 生成订单编号。 */
    private String generateOrderNo() {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = new Random().nextInt(900) + 100;
        return "QC" + time + random;
    }

    /** 生成取餐码。 */
    private String generatePickupCode() {
        int random = new Random().nextInt(900) + 100;
        return "A" + random;
    }
}