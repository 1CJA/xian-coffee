<!-- 仪表盘页面：展示小程序运营概览数据。 -->
<script setup>
/**
 * 仪表盘页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const latestOrders = ref([])
const hotProducts = ref([])
const dashboardStats = ref({ products: [], orders: [], members: [], coupons: [] })

const trendTabs = ['近7天', '近30天', '近90天']
const activeTrend = ref('近7天')
const trendPoints = [45, 38, 56, 62, 50, 68, 64]
const salesPoints = [52, 46, 61, 58, 60, 72, 66]
const chartLabels = ['05-14', '05-15', '05-16', '05-17', '05-18', '05-19', '05-20']

const statusItems = [
  { label: '待付款', value: 25, percent: '19.5%', color: '#6e7e4f' },
  { label: '待接单', value: 32, percent: '25.0%', color: '#b8b07e' },
  { label: '制作中', value: 40, percent: '31.3%', color: '#d7c58f' },
  { label: '已完成', value: 25, percent: '19.5%', color: '#8b8f62' },
  { label: '已取消', value: 6, percent: '4.7%', color: '#d8d2c5' }
]

const quickActions = [
  { name: '商品管理', path: '/products', icon: 'ShoppingBag' },
  { name: '订单管理', path: '/orders', icon: 'Tickets' },
  { name: '会员管理', path: '/members', icon: 'User' },
  { name: '优惠券管理', path: '/coupons', icon: 'Ticket' },
  { name: '门店管理', path: '/stores', icon: 'Shop' },
  { name: '轮播图管理', path: '/home-content', icon: 'Picture' }
]

const notices = [
  { tag: '重要', text: '端午节活动即将开始，优惠券领取时间延长', date: '2025-05-20' },
  { tag: '', text: '新功能上线：会员积分兑换功能', date: '2025-05-18' },
  { tag: '', text: '系统升级维护通知：5月25日凌晨 00:00-02:00', date: '2025-05-15' },
  { tag: '', text: '夏季新品上架，欢迎使用', date: '2025-05-10' }
]

const metricCards = computed(() => [
  { title: '今日订单数', value: String(dashboardStats.value.orders.length || 0), trend: '较昨日 ↑ 12.5%', icon: 'Tickets', tone: 'green' },
  { title: '今日营业额', value: `¥ ${totalOrderAmount.value.toFixed(2)}`, trend: '较昨日 ↑ 8.3%', icon: 'Coin', tone: 'olive' },
  { title: '会员总数', value: String(dashboardStats.value.members.length || 0), trend: '较昨日 ↑ 5.1%', icon: 'UserFilled', tone: 'khaki' },
  { title: '优惠券数量', value: String(dashboardStats.value.coupons.length || 0), trend: '较昨日 ↑ 3.2%', icon: 'Ticket', tone: 'gold' }
])

const totalOrderAmount = computed(() => dashboardStats.value.orders.reduce((sum, item) => sum + Number(item.amount || 0), 0))
const linePath = computed(() => buildLinePath(trendPoints))
const salesPath = computed(() => buildLinePath(salesPoints))
const orderPreview = computed(() => latestOrders.value.slice(0, 4))
const statusSummary = computed(() => statusItems.map((item) => `${item.label} ${item.value} 单`).join('，'))
const chartDots = computed(() => {
  const orderCoords = buildPointCoords(trendPoints)
  const salesCoords = buildPointCoords(salesPoints)

  return chartLabels.flatMap((label, index) => [
    {
      key: `order-${label}`,
      type: '订单数',
      label,
      value: `${trendPoints[index]} 单`,
      x: orderCoords[index].x,
      y: orderCoords[index].y,
      tipX: Math.min(Math.max(orderCoords[index].x - 48, 8), 420),
      tipY: Math.max(orderCoords[index].y - 50, 8),
      tone: 'order-dot'
    },
    {
      key: `sales-${label}`,
      type: '营业额',
      label,
      value: `¥${salesPoints[index]}00`,
      x: salesCoords[index].x,
      y: salesCoords[index].y,
      tipX: Math.min(Math.max(salesCoords[index].x - 48, 8), 420),
      tipY: Math.max(salesCoords[index].y - 50, 8),
      tone: 'sales-dot'
    }
  ])
})

/**
 * 生成默认表单数据。
 */
function buildPointCoords(points) {
  const width = 520
  const height = 220
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1

  return points.map((point, index) => ({
    x: (index / (points.length - 1)) * width,
    y: height - ((point - min) / range) * 120 - 48
  }))
}

/**
 * 生成默认表单数据。
 */
function buildLinePath(points) {
  const coords = buildPointCoords(points)

  return coords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    const previous = coords[index - 1]
    const controlX = (previous.x + point.x) / 2
    return `${path} C ${controlX.toFixed(1)} ${previous.y.toFixed(1)}, ${controlX.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  }, '')
}

/**
 * 加载表格和统计数据。
 */
async function loadDashboard() {
  loading.value = true
  try {
    const data = await getDashboard()
    latestOrders.value = data.latestOrders || []
    hotProducts.value = data.hotProducts || []
    dashboardStats.value = data.stats || { products: [], orders: [], members: [], coupons: [] }
  } finally {
    loading.value = false
  }
}

/**
 * 处理当前页面业务。
 */
function goPage(path) {
  router.push(path)
}

/**
 * 处理当前页面业务。
 */
function getOrderImage(item) {
  return item.orderItems?.[0]?.imageUrl || item.orderItems?.[0]?.image || hotProducts.value[0]?.image || '/admin-assets/latte.png'
}

/**
 * 处理当前页面业务。
 */
function getOrderName(item) {
  return item.items?.[0] || item.orderItems?.[0]?.productName || '咖啡订单'
}

/**
 * 转换页面展示格式。
 */
function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

onMounted(loadDashboard)
</script>

<template>
  <!-- 仪表盘页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="dashboard-page" v-loading="loading">
    <div class="metric-grid">
      <div v-for="item in metricCards" :key="item.title" class="metric-card">
        <div>
          <span>{{ item.title }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.trend }}</p>
        </div>
        <div :class="['metric-icon', item.tone]">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
      </div>
    </div>

    <div class="dashboard-main-grid">
      <section class="panel chart-panel">
        <div class="panel-head">
          <h2>订单统计</h2>
          <div class="tabs">
            <button v-for="item in trendTabs" :key="item" :class="{ active: activeTrend === item }" type="button" @click="activeTrend = item">{{ item }}</button>
          </div>
        </div>
        <div class="chart-legend">
          <span><i class="order-line"></i>订单数</span>
          <span><i class="sales-line"></i>营业额（元）</span>
        </div>
        <div class="line-chart">
          <svg viewBox="0 0 520 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#7b8757" stop-opacity="0.24" />
                <stop offset="1" stop-color="#7b8757" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="`${linePath} L 520 220 L 0 220 Z`" fill="url(#areaGradient)" />
            <path :d="linePath" fill="none" stroke="#7b8757" stroke-width="3" />
            <path :d="salesPath" fill="none" stroke="#b8ad74" stroke-width="3" />
            <g v-for="item in chartDots" :key="item.key" class="chart-dot-group">
              <circle class="hit-dot" :cx="item.x" :cy="item.y" r="16" />
              <circle :class="['chart-dot', item.tone]" :cx="item.x" :cy="item.y" r="4.5" />
              <g class="svg-tip" :transform="`translate(${item.tipX} ${item.tipY})`">
                <rect width="96" height="40" rx="6" />
                <text x="10" y="16">{{ item.label }}</text>
                <text x="10" y="31">{{ item.type }} {{ item.value }}</text>
              </g>
            </g>
          </svg>
          <div class="chart-labels">
            <span v-for="item in chartLabels" :key="item">{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="panel status-panel">
        <div class="panel-head">
          <h2>订单状态分布</h2>
        </div>
        <div class="donut-wrap">
          <div class="donut" :title="statusSummary">
            <div class="donut-tooltip">{{ statusSummary }}</div>
            <div class="donut-center">
              <strong>128</strong>
              <span>订单总数</span>
            </div>
          </div>
          <div class="status-list">
            <div v-for="item in statusItems" :key="item.label" class="status-row">
              <i :style="{ background: item.color }"></i>
              <span>{{ item.label }}</span>
              <b>{{ item.value }} ({{ item.percent }})</b>
            </div>
          </div>
        </div>
      </section>

      <section class="panel latest-panel">
        <div class="panel-head">
          <h2>最新订单</h2>
          <button type="button" @click="goPage('/orders')">更多 ›</button>
        </div>
        <div class="latest-list">
          <div v-for="item in orderPreview" :key="item.id" class="latest-item">
            <img :src="getOrderImage(item)" :alt="item.orderNo" />
            <div class="latest-copy">
              <strong>#{{ item.orderNo }}</strong>
              <span>{{ getOrderName(item) }}</span>
              <em>{{ item.createdAt }}</em>
            </div>
            <div class="latest-side">
              <StatusTag :status="item.statusText" />
              <b>¥{{ formatMoney(item.amount) }}</b>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="bottom-grid">
      <section class="panel quick-panel">
        <div class="panel-head">
          <h2>常用功能</h2>
        </div>
        <div class="quick-list">
          <button v-for="item in quickActions" :key="item.path" type="button" @click="goPage(item.path)">
            <span>
              <el-icon><component :is="item.icon" /></el-icon>
            </span>
            <em>{{ item.name }}</em>
          </button>
        </div>
      </section>

      <section class="panel notice-panel">
        <div class="panel-head">
          <h2>系统公告</h2>
          <button type="button">更多 ›</button>
        </div>
        <div class="notice-list">
          <div v-for="item in notices" :key="item.text" class="notice-row">
            <p><span v-if="item.tag">{{ item.tag }}</span>{{ item.text }}</p>
            <time>{{ item.date }}</time>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* 仪表盘页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.metric-card,
.panel {
  border: 1px solid rgba(213, 201, 181, 0.58);
  border-radius: 6px;
  background: rgba(255, 253, 248, 0.72);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.05);
}

.metric-card {
  height: 144px;
  padding: 26px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-card span {
  color: #4d4b45;
  font-size: 16px;
}

.metric-card strong {
  display: block;
  margin: 14px 0 8px;
  color: #252621;
  font-size: 30px;
  line-height: 36px;
  font-weight: 500;
}

.metric-card p {
  margin: 0;
  color: #6f7660;
  font-size: 14px;
}

.metric-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 34px;
}

.metric-icon.green,
.metric-icon.olive {
  background: #eef4e5;
  color: #738052;
}

.metric-icon.khaki,
.metric-icon.gold {
  background: #f7eee3;
  color: #a07945;
}

.dashboard-main-grid {
  display: grid;
  grid-template-columns: minmax(520px, 1.35fr) minmax(330px, 0.82fr) minmax(350px, 0.8fr);
  align-items: start;
  gap: 22px;
}

.panel {
  padding: 24px;
}
.chart-panel,
.status-panel {
  height: 396px;
  box-sizing: border-box;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-head h2 {
  margin: 0;
  color: #252621;
  font-size: 18px;
}

.panel-head button,
.tabs button {
  border: 0;
  background: transparent;
  color: #8a8275;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 28px;
}

.tabs button {
  position: relative;
  padding: 0 0 8px;
  font-size: 15px;
}

.tabs button.active {
  color: #4f5f3f;
}

.tabs button.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: #788253;
}

.chart-legend {
  margin: 28px 0 8px;
  display: flex;
  justify-content: center;
  gap: 26px;
  color: #4e4a42;
  font-size: 13px;
}

.chart-legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-legend i {
  width: 24px;
  height: 2px;
}

/* 订单区域：控制订单卡片、状态和明细布局。 */
.order-line {
  background: #7b8757;
}

.sales-line {
  background: #b8ad74;
}

.line-chart {
  position: relative;
  height: 290px;
  padding: 0 12px;
}

.line-chart svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 240px;
  overflow: visible;
}

.line-chart path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot-group {
  cursor: pointer;
}

.hit-dot {
  fill: transparent;
}

.chart-dot {
  stroke: #fffdf8;
  stroke-width: 2;
}

.order-dot {
  fill: #7b8757;
}

.sales-dot {
  fill: #b8ad74;
}

.svg-tip {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.chart-dot-group:hover .svg-tip {
  opacity: 1;
}

.svg-tip rect {
  fill: rgba(47, 50, 42, 0.94);
}

.svg-tip text {
  fill: #fffaf1;
  font-size: 10px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: #6e685e;
  font-size: 12px;
}

.status-panel,
.latest-panel {
  min-height: 0;
}

.donut-wrap {
  height: 286px;
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  gap: 20px;
}

.donut {
  width: 176px;
  height: 176px;
  border-radius: 50%;
  background: conic-gradient(#7b8757 0 32%, #d8c58d 32% 58%, #9aa26b 58% 78%, #e6dfd0 78% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut-tooltip {
  position: absolute;
  left: 50%;
  top: -60px;
  z-index: 5;
  width: max-content;
  max-width: 280px;
  padding: 9px 12px;
  border-radius: 6px;
  background: rgba(47, 50, 42, 0.92);
  color: #fffaf1;
  font-size: 12px;
  line-height: 18px;
  white-space: normal;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 6px);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.donut:hover .donut-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.donut-center {
  position: relative;
  z-index: 2;
  width: 94px;
  height: 94px;
  border-radius: 50%;
  background: #fffdf8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.donut-center strong,
.donut-center span {
  display: block;
}

.donut-center strong {
  color: #33362d;
  font-size: 28px;
  line-height: 34px;
  font-weight: 900;
}

.donut-center span {
  margin-top: 4px;
  color: #6d665b;
  font-size: 13px;
  line-height: 18px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status-row {
  display: grid;
  grid-template-columns: 10px 64px 1fr;
  align-items: center;
  gap: 10px;
  color: #766f65;
  font-size: 14px;
}

.status-row i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-row b {
  color: #4d4a43;
  font-weight: 500;
}

.latest-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.latest-item {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  grid-template-areas:
    "image copy"
    "image side";
  gap: 8px 12px;
  min-width: 0;
  padding: 12px;
  border-radius: 8px;
  background: rgba(250, 244, 235, 0.64);
}

.latest-item img {
  grid-area: image;
  width: 62px;
  height: 62px;
  border-radius: 8px;
  object-fit: contain;
  background: #f7efe3;
}

.latest-copy {
  grid-area: copy;
  min-width: 0;
}

.latest-copy strong,
.latest-copy span,
.latest-copy em {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-copy strong {
  color: #2e302a;
  font-size: 13px;
  line-height: 18px;
}

.latest-copy span {
  margin: 4px 0;
  color: #3d3c35;
  font-size: 14px;
  line-height: 20px;
}

.latest-copy em {
  color: #8d8579;
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
}

.latest-side {
  grid-area: side;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.latest-side b {
  flex: 0 0 auto;
  color: #34352f;
  font-size: 15px;
  font-weight: 700;
}

.bottom-grid {
  width: 72.4%;
  margin-top: -205px;
  margin-bottom: -205px;
  display: grid;
  grid-template-columns: minmax(520px, 1.35fr) minmax(330px, 0.82fr);
  gap: 22px;
}

.quick-list {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 22px;
}

.quick-list button {
  border: 0;
  background: transparent;
  color: #35372f;
  cursor: pointer;
}

.quick-list span {
  width: 54px;
  height: 54px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #8a8f62;
  color: #fffaf1;
  display: grid;
  place-items: center;
  font-size: 24px;
}

.quick-list em {
  font-style: normal;
  font-size: 14px;
}

.notice-list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.notice-row p {
  margin: 0;
  color: #46433c;
  font-size: 14px;
}

.notice-row p::before {
  content: "•";
  margin-right: 8px;
  color: #a99b88;
}

.notice-row span {
  margin-right: 10px;
  color: #bd7443;
}

.notice-row time {
  color: #91887c;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 1560px) {
  .dashboard-main-grid {
    grid-template-columns: minmax(0, 1.25fr) minmax(330px, 0.75fr);
  }

  .bottom-grid {
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    grid-template-columns: 1.35fr 0.9fr;
  }

  .latest-panel {
    grid-column: 1 / -1;
  }

  .latest-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

