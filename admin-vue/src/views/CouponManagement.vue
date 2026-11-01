<!-- 优惠券管理页面：维护优惠券规则和状态。 -->
<script setup>
/**
 * 优惠券管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCoupon as deleteCouponApi, getCoupons, saveCoupon } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const coupons = ref([])
const dialogVisible = ref(false)
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const type = ref('')
const status = ref('')

const defaultCoupon = {
  id: '',
  title: '',
  type: '满减',
  rule: '',
  amount: 0,
  status: '可使用',
  startDate: '',
  validDate: '',
  usedCount: 0,
  image: '/admin-assets/coupon-coffee.png',
  miniPage: '优惠券页 / 确认订单页'
}

const form = reactive({ ...defaultCoupon })

const typeOptions = ['满减', '折扣', '搭配']
const statusOptions = ['可使用', '已过期']

const filteredCoupons = computed(() => {
  return coupons.value.filter((item) => {
    const matchKeyword = !keyword.value || item.title.includes(keyword.value) || item.rule.includes(keyword.value) || item.miniPage.includes(keyword.value)
    const matchType = !type.value || item.type === type.value
    const matchStatus = !status.value || item.status === status.value
    return matchKeyword && matchType && matchStatus
  })
})

const activeCount = computed(() => coupons.value.filter((item) => item.status === '可使用').length)
const expiredCount = computed(() => coupons.value.filter((item) => item.status === '已过期').length)
const usedTotal = computed(() => coupons.value.reduce((sum, item) => sum + Number(item.usedCount || 0), 0))
const amountTotal = computed(() => coupons.value.reduce((sum, item) => sum + Number(item.amount || 0), 0))

const couponStats = computed(() => [
  { label: '优惠券总数', value: coupons.value.length, sub: '优惠券页展示', trend: '全部券', trendClass: 'normal', icon: 'Ticket', tone: 'green' },
  { label: '可使用', value: activeCount.value, sub: '确认订单可选', trend: '可抵扣', trendClass: 'up', icon: 'CircleCheck', tone: 'khaki' },
  { label: '已过期', value: expiredCount.value, sub: '不可领取', trend: '需清理', trendClass: 'down', icon: 'Clock', tone: 'brown' },
  { label: '累计使用', value: usedTotal.value, sub: `面额合计 ${amountTotal.value}`, trend: '用户已用', trendClass: 'up', icon: 'TrendCharts', tone: 'coin' }
])

watch(keyword, () => {
  if (keyword.value.length > 16) keyword.value = keyword.value.slice(0, 16)
})

/**
 * 加载页面数据。
 * 从后端接口或本地数据源获取页面所需内容。
 */
async function loadData() {
  loading.value = true
  try {
    coupons.value = await getCoupons()
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { ...defaultCoupon })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  const saved = await saveCoupon({ ...form, image: form.image || defaultCoupon.image })
  const index = coupons.value.findIndex((item) => item.id === saved.id)
  if (index >= 0) coupons.value.splice(index, 1, saved)
  else coupons.value.unshift(saved)
  dialogVisible.value = false
  ElMessage.success('优惠券规则已同步到小程序')
}

/**
 * 转换页面展示格式。
 */
async function toggleCouponStatus(row) {
  const saved = await saveCoupon({ ...row, status: row.status === '可使用' ? '已过期' : '可使用' })
  Object.assign(row, saved)
  ElMessage.success(`优惠券已${row.status === '可使用' ? '恢复使用' : '设为过期'}，会员持有券同步更新`)
}
/**
 * 删除当前选中记录。
 */
function deleteCoupon(row) {
  ElMessageBox.confirm(`确定删除「${row.title}」吗？删除后优惠券页不再展示，会员持有的同名券也会同步移除。`, '删除优惠券', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteCouponApi(row.id)
    coupons.value = coupons.value.filter((item) => item.id !== row.id)
    ElMessage.success('优惠券已删除，会员优惠券已同步')
  }).catch(() => {})
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  type.value = ''
  status.value = ''
}

/**
 * 处理当前页面业务。
 */
function amountText(row) {
  if (row.type === '折扣') return '折扣券'
  return row.amount ? `¥${row.amount}` : '-'
}

onMounted(loadData)
</script>

<template>
  <!-- 优惠券管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="coupon-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in couponStats" :key="item.label" class="coupon-stat admin-card">
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
      <el-select v-model="type" size="large" clearable placeholder="全部类型" class="filter-select">
        <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="status" size="large" clearable placeholder="全部状态" class="filter-select">
        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索优惠券名称 / 规则" />
      <div class="filter-spacer"></div>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button type="primary" size="large" icon="Plus" @click="openDialog()">新增优惠券</el-button>
    </section>

    <section class="coupon-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredCoupons" row-key="id" class="coupon-table" empty-text="暂无优惠券数据">
        <el-table-column label="优惠券信息" min-width="300">
          <template #default="scope">
            <div class="coupon-cell">
              <img class="coupon-thumb" :src="scope.row.image || defaultCoupon.image" :alt="scope.row.title" />
              <div class="coupon-copy">
                <div class="name-line">
                  <strong>{{ scope.row.title }}</strong>
                  <span>{{ scope.row.type }}</span>
                </div>
                <p>{{ scope.row.rule }}</p>
                <em>{{ scope.row.id }}</em>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="面额" width="110">
          <template #default="scope">
            <strong class="amount-text">{{ amountText(scope.row) }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="有效期" width="210">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.startDate || '立即生效' }} - {{ scope.row.validDate || '长期有效' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="已使用" width="110">
          <template #default="scope">
            <strong class="count-text">{{ scope.row.usedCount }}</strong>
            <span class="count-unit">次</span>
          </template>
        </el-table-column>

        <el-table-column label="同步小程序页面" min-width="210">
          <template #default="scope">
            <span class="sync-tag">{{ scope.row.miniPage }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="108">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" type="primary" plain @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" plain @click.stop="toggleCouponStatus(scope.row)">{{ scope.row.status === '可使用' ? '过期' : '启用' }}</el-button>
              <el-button size="small" type="danger" plain @click.stop="deleteCoupon(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="优惠券信息" width="680px" class="coupon-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form :model="form" label-width="100px">
        <div class="dialog-grid">
          <el-form-item label="名称"><el-input v-model="form.title" placeholder="例如 新人饮品券" /></el-form-item>
          <el-form-item label="类型"><el-select v-model="form.type" style="width: 100%"><el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="规则" class="full-line"><el-input v-model="form.rule" placeholder="例如 满20元减8元" /></el-form-item>
          <el-form-item label="金额"><el-input-number v-model="form.amount" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="已使用"><el-input-number v-model="form.usedCount" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="券面图片" class="full-line"><el-input v-model="form.image" placeholder="可填写图片 URL 或 /admin-assets/coupon-coffee.png" /></el-form-item>
          <el-form-item label="同步页面" class="full-line"><el-input v-model="form.miniPage" /></el-form-item>
          <el-form-item label="生效日期"><el-date-picker v-model="form.startDate" value-format="YYYY-MM-DD" type="date" placeholder="选择生效日期" style="width: 100%" /></el-form-item>
          <el-form-item label="到期日期"><el-date-picker v-model="form.validDate" value-format="YYYY-MM-DD" type="date" placeholder="选择到期日期" style="width: 100%" /></el-form-item>
          <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="可使用" /><el-radio-button label="已过期" /></el-radio-group></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存并同步</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
/* 优惠券管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
/* 优惠券区域：控制券面、金额和使用状态。 */
.coupon-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.coupon-stat {
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
  gap: 24px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.filter-select {
  width: 170px;
}

.filter-search {
  width: 320px;
}

.filter-spacer {
  flex: 1;
}

.reset-btn {
  color: #6f675c;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
/* 优惠券表格：控制列表外观。 */
.coupon-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.coupon-table {
  border-radius: 6px;
  overflow: hidden;
}

.coupon-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.coupon-thumb {
  width: 82px;
  height: 72px;
  border-radius: 6px;
  object-fit: contain;
  background: #f7efe3;
  border: 1px solid #eadcc8;
}

.coupon-copy {
  min-width: 0;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-line strong {
  color: #2f312b;
  font-size: 16px;
}

.name-line span {
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f1e2cc;
  color: #9a6a38;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.coupon-copy p {
  max-width: 260px;
  margin: 7px 0 4px;
  overflow: hidden;
  color: #736b60;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coupon-copy em,
.plain-text,
.count-unit {
  color: #a19789;
  font-size: 12px;
  font-style: normal;
}

.amount-text,
.count-text {
  color: #26311f;
  font-size: 17px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  white-space: nowrap;
}

/* 弹窗样式：控制编辑表单和预览区域布局。 */
.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
}

.full-line {
  grid-column: 1 / -1;
}

:deep(.el-table th.el-table__cell) {
  height: 50px;
  background: #f7efdf;
  color: #5d564c;
  font-weight: 900;
}

:deep(.el-table td.el-table__cell) {
  height: 96px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}

:deep(.coupon-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>
