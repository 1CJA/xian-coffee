package com.Coffee.mapper;

import com.Coffee.entity.Member;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 会员数据访问层。
 */
public interface MemberMapper {

    /** 查询全部会员。 */
    @Select("SELECT * FROM member ORDER BY created_at DESC")
    List<Member> selectAll();

    /** 分页查询会员。 */
    @Select("""
            <script>
            SELECT * FROM member
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (nickname LIKE CONCAT('%', #{keyword}, '%') OR phone LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            ORDER BY created_at DESC
            LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Member> selectPage(@Param("keyword") String keyword, @Param("status") Integer status,
                            @Param("offset") Integer offset, @Param("pageSize") Integer pageSize);

    /** 统计会员数量。 */
    @Select("""
            <script>
            SELECT COUNT(*) FROM member
            <where>
                <if test="keyword != null and keyword != ''">
                    AND (nickname LIKE CONCAT('%', #{keyword}, '%') OR phone LIKE CONCAT('%', #{keyword}, '%'))
                </if>
                <if test="status != null">
                    AND status = #{status}
                </if>
            </where>
            </script>
            """)
    Long countPage(@Param("keyword") String keyword, @Param("status") Integer status);

    /** 根据ID查询会员。 */
    @Select("SELECT * FROM member WHERE id = #{id}")
    Member selectById(Long id);

    /** 新增会员。 */
    @Insert("""
            INSERT INTO member(openid, nickname, phone, password, avatar_url, level_name, points, balance, stamp_count, stamp_exchange_count, status)
            VALUES(#{openid}, #{nickname}, #{phone}, #{password}, #{avatarUrl}, #{levelName}, #{points}, #{balance}, #{stampCount}, #{stampExchangeCount}, #{status})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Member member);

    /** 修改会员。 */
    @Update("""
            UPDATE member
            SET openid = #{openid}, nickname = #{nickname}, phone = #{phone}, password = #{password}, avatar_url = #{avatarUrl},
                level_name = #{levelName}, points = #{points}, balance = #{balance}, stamp_count = #{stampCount},
                stamp_exchange_count = #{stampExchangeCount}, status = #{status}, updated_at = NOW()
            WHERE id = #{id}
            """)
    int update(Member member);

    /** 禁用会员。 */
    @Update("UPDATE member SET status = 0, updated_at = NOW() WHERE id = #{id}")
    int disableById(Long id);

    /** 调整积分。 */
    @Update("UPDATE member SET points = points + #{points}, updated_at = NOW() WHERE id = #{id}")
    int addPoints(@Param("id") Long id, @Param("points") Integer points);


    /** 原子兑换集点。 */
    @Update("UPDATE member SET stamp_count = 0, stamp_exchange_count = stamp_exchange_count + 1, updated_at = NOW() WHERE id = #{id} AND stamp_count >= 10")
    int redeemStamp(Long id);
    /** 调整集点。 */
    @Update("UPDATE member SET stamp_count = #{stampCount}, stamp_exchange_count = stamp_exchange_count + #{exchangeCount}, updated_at = NOW() WHERE id = #{id}")
    int updateStamp(@Param("id") Long id, @Param("stampCount") Integer stampCount, @Param("exchangeCount") Integer exchangeCount);
}