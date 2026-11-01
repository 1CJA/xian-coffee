package com.Coffee.mapper;

import com.Coffee.entity.Order;
import com.Coffee.entity.OrderItem;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 订单数据访问层。
 */
public interface OrderMapper {

    /** 分页查询订单。 */
    @Select("""
            <script>
            SELECT o.*, m.nickname AS member_name, m.phone AS member_phone, s.name AS store_name
            FROM orders o
            LEFT JOIN member m ON o.member_id = m.id
            LEFT JOIN store s ON o.store_id = s.id
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (o.order_no LIKE CONCAT('%', #{keyword}, '%') OR m.nickname LIKE CONCAT('%', #{keyword}, '%') OR m.phone LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null and status != ''">
                    AND o.status = #{status}
                </if>
            </where>
            ORDER BY o.created_at DESC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Order> selectPage(@Param("keyword") String keyword, @Param("status") String status,
                           @Param("offset") Integer offset, @Param("pageSize") Integer pageSize);

    /** 统计订单数量。 */
    @Select("""
            <script>
            SELECT COUNT(*)
            FROM orders o
            LEFT JOIN member m ON o.member_id = m.id
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (o.order_no LIKE CONCAT('%', #{keyword}, '%') OR m.nickname LIKE CONCAT('%', #{keyword}, '%') OR m.phone LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null and status != ''">
                    AND o.status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("status") String status);

    /** 根据ID查询订单。 */
    @Select("""
            SELECT o.*, m.nickname AS member_name, m.phone AS member_phone, s.name AS store_name
            FROM orders o
            LEFT JOIN member m ON o.member_id = m.id
            LEFT JOIN store s ON o.store_id = s.id
            WHERE o.id = #{id}
            """)
    Order selectById(Long id);

    /** 查询订单明细。 */
    @Select("SELECT * FROM order_item WHERE order_id = #{orderId} ORDER BY id ASC")
    List<OrderItem> selectItemsByOrderId(Long orderId);

    /** 新增订单。 */
    @Insert("""
            INSERT INTO orders(order_no, member_id, store_id, address_id, order_type, status, total_amount, coupon_amount,
                               points_amount, pay_amount, use_points, member_coupon_id, remark, pickup_code, pay_time)
            VALUES(#{orderNo}, #{memberId}, #{storeId}, #{addressId}, #{orderType}, #{status}, #{totalAmount}, #{couponAmount},
                   #{pointsAmount}, #{payAmount}, #{usePoints}, #{memberCouponId}, #{remark}, #{pickupCode}, #{payTime})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Order order);

    /** 新增订单明细。 */
    @Insert("""
            INSERT INTO order_item(order_id, product_id, product_name, product_image_path, unit_price, quantity, spec_text, item_amount)
            VALUES(#{orderId}, #{productId}, #{productName}, #{productImagePath}, #{unitPrice}, #{quantity}, #{specText}, #{itemAmount})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertItem(OrderItem item);

    /** 支付订单。 */
    @Update("UPDATE orders SET status = 'PAID', pay_time = NOW(), updated_at = NOW() WHERE id = #{id}")
    int markPaid(Long id);

    /** 取消订单。 */
    @Update("UPDATE orders SET status = 'CANCELLED', cancel_reason = #{reason}, updated_at = NOW() WHERE id = #{id}")
    int cancel(@Param("id") Long id, @Param("reason") String reason);

    /** 修改订单状态。 */
    @Update("UPDATE orders SET status = #{status}, updated_at = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    /** 删除订单。 */
    @Delete("DELETE FROM orders WHERE id = #{id}")
    int deleteById(Long id);
}