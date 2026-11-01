<!-- 订单详情页面：展示后台订单详细信息。 -->
<script setup>
/**
 * 订单详情页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrder } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

const route = useRoute()
const router = useRouter()
const order = ref(null)

/**
 * 加载表格和统计数据。
 */
async function loadOrder() {
  order.value = await getOrder(route.params.id)
}

onMounted(loadOrder)
</script>

<template>
  <!-- 订单详情页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="page-view">
    <div class="page-title-row">
      <div>
        <h2>订单详情预览</h2>
        <p>对应微信小程序订单详情页，展示取餐、商品、金额和备注信息。</p>
      </div>
      <el-button @click="router.back()">返回订单管理</el-button>
    </div>

    <el-empty v-if="!order" description="订单不存在" />
    <template v-else>
      <div class="order-detail-grid">
        <div class="order-ticket admin-card">
          <div class="ticket-top">
            <span class="mini-page-pill">订单详情页</span>
            <StatusTag :status="order.statusText" />
          </div>
          <h3>{{ order.orderNo }}</h3>
          <p>{{ order.user }} · {{ order.phone }}</p>
          <div class="ticket-amount">¥{{ order.amount }}</div>
          <div class="ticket-meta">
            <span>来源：{{ order.sourcePage }}</span>
            <span>下单：{{ order.createdAt }}</span>
          </div>
        </div>

        <div class="admin-card info-card">
          <h3>取餐和备注</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="取餐门店">{{ order.storeName }}</el-descriptions-item>
            <el-descriptions-item label="订单备注">{{ order.remark || '无' }}</el-descriptions-item>
            <el-descriptions-item label="商品数量">{{ order.itemCount }} 件</el-descriptions-item>
            <el-descriptions-item label="退款/返还">{{ order.refundText || (order.status === 'cancelled' ? '已取消，等待核对返还记录' : '无返还') }}</el-descriptions-item>
            <el-descriptions-item label="取消原因">{{ order.cancelReason || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div class="admin-card item-card">
        <h3>商品清单</h3>
        <div class="order-item-list">
          <div v-for="item in order.items" :key="item" class="order-item-row">
            <img src="/admin-assets/latte.png" alt="商品" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* 订单详情页面 页面样式。 */
/* 订单区域：控制订单卡片、状态和明细布局。 */
.order-detail-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
}

.order-ticket,
.info-card,
.item-card {
  padding: 22px;
}

.ticket-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-ticket h3 {
  margin: 24px 0 8px;
  color: #26311f;
  font-size: 24px;
}

.order-ticket p {
  margin: 0;
  color: #746955;
}

.ticket-amount {
  margin: 26px 0;
  color: #667452;
  font-size: 42px;
  font-weight: 900;
}

.ticket-meta span {
  display: block;
  margin-top: 8px;
  color: #766d5a;
}

.info-card h3,
.item-card h3 {
  margin: 0 0 18px;
  color: #26311f;
}

.order-item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item-row {
  padding: 12px;
  border: 1px solid rgba(178, 154, 114, 0.28);
  border-radius: 8px;
  background: #fff8ea;
  display: flex;
  align-items: center;
  gap: 14px;
}

.order-item-row img {
  width: 64px;
  height: 54px;
  object-fit: contain;
  border-radius: 8px;
  background: #f4ead9;
}

.order-item-row span {
  color: #26311f;
  font-weight: 700;
}
</style>
