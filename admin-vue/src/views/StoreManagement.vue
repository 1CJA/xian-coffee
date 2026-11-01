<!-- 门店管理页面：维护门店信息、图片和视频。 -->
<script setup>
/**
 * 门店管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getStores, saveStore } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const stores = ref([])
const dialogVisible = ref(false)
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const status = ref('')
const city = ref('')
const sortMode = ref('createdDesc')

const defaultStore = {
  id: '',
  name: '',
  city: '',
  address: '',
  phone: '',
  openTime: '',
  status: '营业中',
  image: '/admin-assets/hero-store.png',
  miniPage: '门店详情页 / 确认订单页',
  orderCount: 0,
  todayAmount: 0,
  tag: ''
}

const form = reactive({ ...defaultStore })

const statusOptions = ['营业中', '休息中']
const sortOptions = [
  { label: '创建时间 ↓', value: 'createdDesc' },
  { label: '订单数 ↓', value: 'orderDesc' },
  { label: '营业额 ↓', value: 'amountDesc' }
]

const cityOptions = computed(() => [...new Set(stores.value.map((item) => item.city).filter(Boolean))])
const runningCount = computed(() => stores.value.filter((item) => item.status === '营业中').length)
const restingCount = computed(() => stores.value.filter((item) => item.status === '休息中').length)
const todayOrderTotal = computed(() => stores.value.reduce((sum, item) => sum + Number(item.orderCount || 0), 0))
const todayAmountTotal = computed(() => stores.value.reduce((sum, item) => sum + Number(item.todayAmount || 0), 0))

const storeStats = computed(() => [
  { label: '门店总数', value: stores.value.length, sub: '小程序可选门店', trend: '全部门店', trendClass: 'normal', icon: 'Shop', tone: 'green' },
  { label: '营业中', value: runningCount.value, sub: '当前可下单', trend: '正常营业', trendClass: 'up', icon: 'CircleCheck', tone: 'khaki' },
  { label: '休息中', value: restingCount.value, sub: '暂停接单', trend: '可恢复', trendClass: 'down', icon: 'Clock', tone: 'brown' },
  { label: '今日营业额', value: `¥${todayAmountTotal.value.toLocaleString()}`, sub: `${todayOrderTotal.value} 单`, trend: '今日订单', trendClass: 'up', icon: 'Money', tone: 'coin' }
])

const filteredStores = computed(() => {
  const list = stores.value.filter((item) => {
    const matchKeyword = !keyword.value || item.name.includes(keyword.value) || item.address.includes(keyword.value) || item.phone.includes(keyword.value)
    const matchStatus = !status.value || item.status === status.value
    const matchCity = !city.value || item.city === city.value
    return matchKeyword && matchStatus && matchCity
  })

  return list.slice().sort((a, b) => {
    if (sortMode.value === 'orderDesc') return Number(b.orderCount || 0) - Number(a.orderCount || 0)
    if (sortMode.value === 'amountDesc') return Number(b.todayAmount || 0) - Number(a.todayAmount || 0)
    return Number(b.id || 0) - Number(a.id || 0)
  })
})

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
    stores.value = await getStores()
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { ...defaultStore })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  const saved = await saveStore({ ...form, image: form.image || defaultStore.image })
  const index = stores.value.findIndex((item) => item.id === saved.id)
  if (index >= 0) stores.value.splice(index, 1, saved)
  else stores.value.unshift(saved)
  dialogVisible.value = false
  ElMessage.success('门店信息已同步到小程序')
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  status.value = ''
  city.value = ''
  sortMode.value = 'createdDesc'
}

/**
 * 处理当前页面业务。
 */
function searchStores() {
  ElMessage.success('已按条件筛选门店')
}

/**
 * 处理当前页面业务。
 */
function viewStore(row) {
  ElMessage.info(`${row.name} 会展示在小程序门店详情页和确认订单页`)
}

/**
 * 转换页面展示格式。
 */
async function toggleStoreStatus(row) {
  const saved = await saveStore({ ...row, status: row.status === '营业中' ? '休息中' : '营业中' })
  Object.assign(row, saved)
  ElMessage.success(`${row.name} 已${row.status === '营业中' ? '开业' : '停业'}，确认订单门店状态已同步`)
}
onMounted(loadData)
</script>

<template>
  <!-- 门店管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="store-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in storeStats" :key="item.label" class="store-stat admin-card">
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
      <label class="filter-field name-field">
        <span>门店名称</span>
        <el-input v-model="keyword" size="large" clearable placeholder="请输入门店名称" />
      </label>
      <label class="filter-field">
        <span>门店状态</span>
        <el-select v-model="status" size="large" clearable placeholder="全部状态">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>所在城市</span>
        <el-select v-model="city" size="large" clearable placeholder="全部城市">
          <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>排序方式</span>
        <el-select v-model="sortMode" size="large">
          <el-option v-for="item in sortOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </label>
      <el-button class="search-btn" size="large" type="primary" icon="Search" @click="searchStores">搜索</el-button>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button class="add-btn" size="large" type="primary" icon="Plus" @click="openDialog()">新增门店</el-button>
    </section>

    <section class="store-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredStores" row-key="id" class="store-table" empty-text="暂无门店数据">
        <el-table-column label="门店信息" min-width="250">
          <template #default="scope">
            <div class="store-cell">
              <img class="store-thumb" :src="scope.row.image || defaultStore.image" :alt="scope.row.name" />
              <div class="store-copy">
                <div class="name-line">
                  <strong>{{ scope.row.name }}</strong>
                  <span v-if="scope.row.tag">{{ scope.row.tag }}</span>
                </div>
                <p>{{ scope.row.miniPage }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="地址" min-width="260">
          <template #default="scope">
            <span class="address-text">{{ scope.row.address }}</span>
          </template>
        </el-table-column>

        <el-table-column label="联系电话" width="150">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>

        <el-table-column label="营业时间" width="130">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.openTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="营业状态" width="110">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="今日订单" width="100">
          <template #default="scope">
            <strong class="count-text">{{ scope.row.orderCount || 0 }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="今日营业额" width="130">
          <template #default="scope">
            <strong class="amount-text">¥{{ Number(scope.row.todayAmount || 0).toLocaleString() }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="168" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" text @click.stop="viewStore(scope.row)">查看</el-button>
              <el-button size="small" text class="danger-text" @click.stop="toggleStoreStatus(scope.row)">{{ scope.row.status === '营业中' ? '停业' : '开业' }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <span>共 {{ filteredStores.length }} 条数据</span>
        <div class="pager-mock"><button>‹</button><strong>1</strong><button>›</button><em>10 条/页</em></div>
      </div>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="门店信息" width="640px" class="store-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form :model="form" label-width="92px">
        <el-form-item label="门店名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="城市"><el-input v-model="form.city" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="营业时间"><el-input v-model="form.openTime" /></el-form-item>
        <el-form-item label="门店图片"><el-input v-model="form.image" placeholder="可填写图片 URL 或 /admin-assets/hero-store.png" /></el-form-item>
        <el-form-item label="今日订单"><el-input-number v-model="form.orderCount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="今日营业额"><el-input-number v-model="form.todayAmount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="营业中" /><el-radio-button label="休息中" /></el-radio-group></el-form-item>
        <el-form-item label="同步页面"><el-input v-model="form.miniPage" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存并同步</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
/* 门店管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.store-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.store-stat {
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
  min-height: 106px;
  padding: 20px 26px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: nowrap;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
  overflow-x: auto;
}

.filter-field {
  width: 168px;
  flex: 0 0 168px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #4e4a42;
  font-size: 14px;
  font-weight: 700;
}

.name-field {
  width: 190px;
  flex-basis: 190px;
}

.search-btn,
.reset-btn,
.add-btn {
  flex: 0 0 auto;
  height: 40px;
}

.add-btn {
  margin-left: auto;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
/* 门店表格：控制列表外观。 */
.store-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.store-table {
  border-radius: 6px;
  overflow: hidden;
}

.store-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.store-thumb {
  width: 82px;
  height: 72px;
  border-radius: 6px;
  object-fit: cover;
  background: #f7efe3;
  border: 1px solid #eadcc8;
}

.store-copy {
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
  background: #eef4e5;
  color: #596847;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.store-copy p,
.address-text,
.plain-text {
  color: #736b60;
  font-size: 13px;
}

.store-copy p {
  margin: 7px 0 0;
}

.count-text,
.amount-text {
  color: #26311f;
  font-size: 15px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.danger-text {
  color: #b86644;
}

.table-footer {
  height: 58px;
  padding: 0 16px;
  border-top: 1px solid #eee4d6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7e7568;
  font-size: 13px;
}

.pager-mock {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pager-mock button,
.pager-mock strong {
  width: 30px;
  height: 30px;
  border: 1px solid #dfd3c2;
  border-radius: 6px;
  background: #fffdf8;
  color: #7e7568;
}

.pager-mock strong {
  background: #667452;
  color: #fffaf1;
  display: grid;
  place-items: center;
}

.pager-mock em {
  font-style: normal;
}

:deep(.el-table th.el-table__cell) {
  height: 50px;
  background: #f7efdf;
  color: #5d564c;
  font-weight: 900;
}

:deep(.el-table td.el-table__cell) {
  height: 102px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}

:deep(.store-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>
