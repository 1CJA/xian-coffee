<!-- 订单管理页面：查询订单并处理状态流转。 -->
<script setup>
/**
 * 订单管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrders, updateOrderStatus } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
// 订单数据：保存当前页面展示的订单列表。
const orders = ref([])
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const status = ref('')

const statusOptions = [
  { label: '待付款', value: 'pending', text: '待付款' },
  { label: '制作中', value: 'making', text: '制作中' },
  { label: '已完成', value: 'done', text: '已完成' },
  { label: '已取消', value: 'cancelled', text: '已取消' }
]

const filteredOrders = computed(() => {
  return orders.value
    .filter((item) => {
      const matchKeyword = !keyword.value || item.orderNo.includes(keyword.value) || item.user.includes(keyword.value) || item.phone.includes(keyword.value) || item.storeName.includes(keyword.value)
      const matchStatus = !status.value || item.status === status.value
      return matchKeyword && matchStatus
    })
    .slice()
    .sort((a, b) => new Date(b.createdAt.replace(/-/g, '/')) - new Date(a.createdAt.replace(/-/g, '/')))
})

const totalAmount = computed(() => orders.value.reduce((sum, item) => sum + Number(item.amount || 0), 0))
const pendingCount = computed(() => orders.value.filter((item) => item.status === 'pending').length)
const makingCount = computed(() => orders.value.filter((item) => item.status === 'making').length)
const doneCount = computed(() => orders.value.filter((item) => item.status === 'done').length)

const orderStats = computed(() => [
  { label: '订单总数', value: orders.value.length, sub: '小程序提交', trend: '实时同步', trendClass: 'normal', icon: 'Tickets', tone: 'green' },
  { label: '待付款', value: pendingCount.value, sub: '我的订单页', trend: '需跟进', trendClass: 'down', icon: 'Wallet', tone: 'khaki' },
  { label: '制作中', value: makingCount.value, sub: '门店出杯', trend: '处理中', trendClass: 'up', icon: 'CoffeeCup', tone: 'brown' },
  { label: '订单金额', value: `¥${totalAmount.value.toFixed(2)}`, sub: '已记录订单', trend: `${doneCount.value} 单完成`, trendClass: 'up', icon: 'Money', tone: 'coin' }
])

watch(keyword, () => {
  if (keyword.value.length > 18) keyword.value = keyword.value.slice(0, 18)
})

/**
 * 加载页面数据。
 * 从后端接口或本地数据源获取页面所需内容。
 */
async function loadData() {
  loading.value = true
  try {
    orders.value = await getOrders()
  } finally {
    loading.value = false
  }
}

/**
 * 处理当前页面业务。
 */
async function changeStatus(row, nextStatus) {
  const option = statusOptions.find((item) => item.value === nextStatus)
  const updated = await updateOrderStatus({ id: row.id, status: nextStatus, statusText: option.text })
  Object.assign(row, updated)
  ElMessage.success('订单状态已同步到小程序我的订单页')
}

/**
 * 处理当前页面业务。
 */
function cancelOrder(row) {
  if (row.status === 'cancelled') {
    ElMessage.info('该订单已经取消')
    return
  }

  ElMessageBox.confirm(`确定取消订单「${row.orderNo}」吗？系统将模拟退回金额、积分和优惠券。`, '管理员取消订单', {
    confirmButtonText: '确认取消',
    cancelButtonText: '再想想',
    type: 'warning'
  }).then(async () => {
    const refundText = `已退回 ¥${row.amount}，积分和优惠券已返还给用户`
    const updated = await updateOrderStatus({
      id: row.id,
      status: 'cancelled',
      statusText: '已取消',
      refundStatus: '已退回',
      refundText,
      cancelReason: '管理员取消'
    })
    Object.assign(row, updated)
    ElMessage.success('订单已取消，金额、积分和优惠券已返还')
  }).catch(() => {})
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  status.value = ''
}

/**
 * 处理当前页面业务。
 */
function goDetail(row) {
  router.push(`/orders/${row.id}`)
}

/**
 * 处理当前页面业务。
 */
function statusCount(value) {
  return orders.value.filter((item) => item.status === value).length
}


onMounted(loadData)
</script>

<template>
  <!-- 订单管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="order-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in orderStats" :key="item.label" class="order-stat admin-card">
        <div :class="['stat-icon', item.tone]">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="stat-copy">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.sub }} <em :class="item.trendClass">{{ item.trend }}</em></p>
        </div>
      </div>
    </div>

    <!-- 查询筛选区：输入关键字、选择状态并触发筛选。 -->

    <section class="filter-bar admin-card">
      <el-select v-model="status" size="large" clearable placeholder="全部状态" class="filter-select">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索订单号 / 用户 / 门店" />
      <div class="status-tabs">
        <button v-for="item in statusOptions" :key="item.value" type="button" :class="{ active: status === item.value }" @click="status = status === item.value ? '' : item.value">
          {{ item.label }}<span>{{ statusCount(item.value) }}</span>
        </button>
      </div>
      <div class="filter-spacer"></div>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
    </section>

    <section class="order-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredOrders" row-key="id" class="order-table" empty-text="暂无订单数据">
        <el-table-column label="订单信息" min-width="220">
          <template #default="scope">
            <div class="order-main">
              <strong>{{ scope.row.orderNo }}</strong>
              <span>{{ scope.row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户" min-width="190">
          <template #default="scope">
            <div class="user-cell">
              <img class="user-avatar" :src="scope.row.avatar || '/admin-assets/user-avatar.png'" :alt="scope.row.user" />
              <div class="user-copy">
                <strong>{{ scope.row.user }}</strong>
                <span>{{ scope.row.phone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="商品内容" min-width="260">
          <template #default="scope">
            <div class="order-items">
              <span v-for="item in scope.row.items.slice(0, 2)" :key="item">{{ item }}</span>
              <small v-if="scope.row.items.length > 2">共 {{ scope.row.itemCount }} 件</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="实付金额" width="116">
          <template #default="scope">
            <strong class="amount-text">¥{{ scope.row.amount }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="取餐门店" min-width="200">
          <template #default="scope">
            <span class="store-text">{{ scope.row.storeName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="来源页面" min-width="130">
          <template #default="scope">
            <span class="sync-tag">{{ scope.row.sourcePage }}</span>
          </template>
        </el-table-column>

        <el-table-column label="退款/返还" min-width="180">
          <template #default="scope">
            <div class="refund-box">
              <span v-if="scope.row.refundText">{{ scope.row.refundText }}</span>
              <span v-else-if="scope.row.status === 'cancelled'">已取消，等待核对返还记录</span>
              <span v-else>无返还</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="150">
          <template #default="scope">
            <span class="remark-text">{{ scope.row.cancelReason || scope.row.remark || '无' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="108">
          <template #default="scope">
            <StatusTag :status="scope.row.statusText" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="230" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="goDetail(scope.row)">详情</el-button>
              <el-dropdown trigger="click" @command="(command) => changeStatus(scope.row, command)">
                <el-button size="small" type="primary" plain>改状态</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="item in statusOptions" :key="item.value" :command="item.value">{{ item.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button size="small" type="danger" plain :disabled="scope.row.status === 'cancelled'" @click.stop="cancelOrder(scope.row)">取消订单</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<style scoped>
/* 订单管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
/* 订单区域：控制订单卡片、状态和明细布局。 */
.order-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.order-stat {
  height: 132px;
  padding: 26px 30px;
  display: flex;
  align-items: center;
  gap: 24px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 34px;
}

.stat-icon.green {
  background: #eef4e5;
  color: #738052;
}

.stat-icon.khaki,
.stat-icon.brown,
.stat-icon.coin {
  background: #fbf3e8;
  color: #9a6f41;
}

.stat-copy span {
  color: #4e4a42;
  font-size: 15px;
}

.stat-copy strong {
  display: block;
  margin: 8px 0 6px;
  color: #252621;
  font-size: 30px;
  line-height: 36px;
  font-weight: 900;
}

.stat-copy p {
  margin: 0;
  color: #8a8275;
  font-size: 13px;
}

.stat-copy em {
  margin-left: 10px;
  font-style: normal;
  font-weight: 900;
}

.stat-copy em.up {
  color: #4f8b47;
}

.stat-copy em.down {
  color: #c36a44;
}

.stat-copy em.normal {
  color: #7a6f63;
}

/* 筛选栏：控制查询条件和按钮的横向排版。 */
.filter-bar {
  min-height: 78px;
  padding: 18px 26px;
  display: flex;
  align-items: center;
  gap: 18px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.filter-select {
  width: 170px;
}

.filter-search {
  width: 300px;
}

.status-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tabs button {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #dfd3c2;
  border-radius: 999px;
  background: #fffdf8;
  color: #6d665b;
  cursor: pointer;
}

.status-tabs button.active {
  border-color: #667452;
  background: #667452;
  color: #fffaf1;
}

.status-tabs span {
  margin-left: 6px;
  font-weight: 900;
}

.filter-spacer {
  flex: 1;
}

.reset-btn {
  color: #6f675c;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
/* 订单表格：控制列表外观。 */
.order-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.order-table {
  border-radius: 6px;
  overflow: hidden;
}

.order-main strong,
.order-main span,
.order-main em,
.order-items span,
.order-items small,
.user-copy strong,
.user-copy span {
  display: block;
}

.order-main strong {
  color: #2f312b;
  font-size: 15px;
}

.order-main span {
  margin-top: 6px;
  color: #6d665b;
  font-size: 13px;
}

.order-main em {
  margin-top: 5px;
  color: #a19789;
  font-size: 12px;
  font-style: normal;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  background: #eadcc8;
  border: 1px solid #e2d3bf;
}

.user-copy strong {
  color: #2f312b;
  font-size: 14px;
}

.user-copy span {
  margin-top: 5px;
  color: #8a8275;
  font-size: 12px;
}

.order-items span {
  max-width: 260px;
  overflow: hidden;
  color: #403c35;
  font-size: 13px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-items small {
  margin-top: 4px;
  color: #8a8275;
  font-size: 12px;
}

.amount-text {
  color: #26311f;
  font-size: 18px;
}

.store-text,
.remark-text {
  color: #736b60;
  font-size: 13px;
}

.refund-box span {
  color: #8a6a42;
  font-size: 12px;
  line-height: 18px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

:deep(.el-table th.el-table__cell) {
  height: 50px;
  background: #f7efdf;
  color: #5d564c;
  font-weight: 900;
}

:deep(.el-table td.el-table__cell) {
  height: 92px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}
</style>
