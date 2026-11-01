<!-- 轮播图管理页面：管理小程序首页轮播图数据。 -->
<script setup>
/**
 * 轮播图管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCarousel, getCarousels, saveCarousel } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const banners = ref([])
const dialogVisible = ref(false)
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const status = ref('')
const targetPage = ref('')

const defaultBanner = {
  id: '',
  title: '',
  image: '/admin-assets/carousel-latte.jpg',
  targetPage: '功能入口页',
  route: 'pages/entry/entry',
  sort: 1,
  status: '启用',
  updatedAt: '',
  remark: ''
}

const form = reactive({ ...defaultBanner })

const statusOptions = ['启用', '停用']
const pageOptions = [
  { label: '功能入口页', value: '功能入口页', route: 'pages/entry/entry' },
  { label: '菜单点单页', value: '菜单点单页', route: 'pages/menu/menu' },
  { label: '会员中心页', value: '会员中心页', route: 'pages/memberCenter/memberCenter' },
  { label: '优惠券页', value: '优惠券页', route: 'pages/coupons/coupons' },
  { label: '门店详情页', value: '门店详情页', route: 'pages/storeDetail/storeDetail' }
]

const filteredBanners = computed(() => {
  return banners.value
    .filter((item) => {
      const key = keyword.value.trim()
      const matchKeyword = !key || item.title.includes(key) || item.targetPage.includes(key)
      const matchStatus = !status.value || item.status === status.value
      const matchPage = !targetPage.value || item.targetPage === targetPage.value
      return matchKeyword && matchStatus && matchPage
    })
    .slice()
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
})

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
    banners.value = await getCarousels()
  } finally {
    loading.value = false
  }
}

/**
 * 处理当前页面业务。
 */
function currentTime() {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { ...defaultBanner, sort: banners.value.length + 1, updatedAt: currentTime() })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  if (!form.title || !form.image) {
    ElMessage.warning('请填写轮播图标题和图片地址')
    return
  }
  const page = pageOptions.find((item) => item.value === form.targetPage)
  const saved = await saveCarousel({ ...form, route: page?.route || form.route, updatedAt: currentTime() })
  const index = banners.value.findIndex((item) => String(item.id) === String(saved.id))
  if (index >= 0) banners.value.splice(index, 1, saved)
  else banners.value.unshift(saved)
  dialogVisible.value = false
  ElMessage.success('轮播图已同步到小程序')
}

/**
 * 删除当前选中记录。
 */
function deleteBanner(row) {
  ElMessageBox.confirm(`确定删除「${row.title}」吗？删除后小程序轮播图不再展示。`, '删除轮播图', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteCarousel(row.id)
    banners.value = banners.value.filter((item) => item.id !== row.id)
    ElMessage.success('轮播图已删除')
  }).catch(() => {})
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  status.value = ''
  targetPage.value = ''
}

/**
 * 处理当前页面业务。
 */
function searchBanners() {
  ElMessage.success('已按条件筛选轮播图')
}

onMounted(loadData)
</script>

<template>
  <!-- 轮播图管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="carousel-page page-view" v-loading="loading">
    <!-- 查询筛选区：输入关键字、选择状态并触发筛选。 -->
    <section class="filter-bar admin-card">
      <label class="filter-field keyword-field">
        <span>关键词</span>
        <el-input v-model="keyword" size="large" clearable placeholder="请输入标题" />
      </label>
      <label class="filter-field">
        <span>状态</span>
        <el-select v-model="status" size="large" clearable placeholder="全部状态">
          <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>跳转页面</span>
        <el-select v-model="targetPage" size="large" clearable placeholder="全部页面">
          <el-option v-for="item in pageOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </label>
      <el-button class="search-btn" size="large" type="primary" icon="Search" @click="searchBanners">查询</el-button>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
    </section>

    <div class="add-row">
      <el-button type="primary" icon="Plus" size="large" @click="openDialog()">新增轮播图</el-button>
    </div>

    <section class="carousel-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredBanners" row-key="id" class="carousel-table" empty-text="暂无轮播图数据">
        <el-table-column label="轮播图" min-width="310">
          <template #default="scope">
            <div class="banner-cell">
              <img class="banner-thumb" :src="scope.row.image" :alt="scope.row.title" />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标题" min-width="210">
          <template #default="scope">
            <span class="title-text">{{ scope.row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column label="跳转页面" width="140">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.targetPage }}</span>
          </template>
        </el-table-column>

        <el-table-column label="排序" width="90">
          <template #default="scope">
            <strong class="sort-text">{{ scope.row.sort }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="190">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.updatedAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="170" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" text class="danger-text" @click.stop="deleteBanner(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <span>共 {{ filteredBanners.length }} 条</span>
        <div class="pager-mock"><button>‹</button><strong>1</strong><button>›</button><em>10条/页</em></div>
      </div>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="轮播图信息" width="680px" class="carousel-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form :model="form" label-width="92px">
        <div class="dialog-grid">
          <el-form-item label="标题"><el-input v-model="form.title" placeholder="请输入轮播图标题" /></el-form-item>
          <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="启用" /><el-radio-button label="停用" /></el-radio-group></el-form-item>
          <el-form-item label="跳转页面"><el-select v-model="form.targetPage" style="width: 100%"><el-option v-for="item in pageOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" style="width: 100%" /></el-form-item>
          <el-form-item label="图片地址" class="full-line"><el-input v-model="form.image" placeholder="可填写 /admin-assets/carousel-latte.jpg 或图片 URL" /></el-form-item>
          <el-form-item label="备注" class="full-line"><el-input v-model="form.remark" type="textarea" :rows="3" placeholder="只用于后台说明，不影响小程序展示" /></el-form-item>
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
/* 轮播图管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.carousel-page {
  gap: 22px;
}

/* 筛选栏：控制查询条件和按钮的横向排版。 */
.filter-bar {
  min-height: 106px;
  padding: 20px 26px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: nowrap;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
  overflow-x: auto;
}

.filter-field {
  width: 156px;
  flex: 0 0 156px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #4e4a42;
  font-size: 14px;
  font-weight: 700;
}

.keyword-field {
  width: 210px;
  flex-basis: 210px;
}


.search-btn,
.reset-btn {
  width: 92px;
  flex: 0 0 92px;
  height: 40px;
}

.reset-btn {
  color: #6f675c;
}
.add-row {
  height: 44px;
  display: flex;
  align-items: center;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
.carousel-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.carousel-table {
  border-radius: 6px;
  overflow: hidden;
}

.banner-cell {
  display: flex;
  align-items: center;
}

.banner-thumb {
  width: 260px;
  height: 96px;
  border-radius: 8px;
  object-fit: cover;
  background: #f4ead9;
  border: 1px solid #eadcc8;
}

.title-text {
  color: #2f312b;
  font-size: 15px;
  font-weight: 800;
}

.plain-text {
  color: #706858;
  font-size: 13px;
}

.sort-text {
  color: #26311f;
  font-size: 15px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 24px;
  white-space: nowrap;
}

.danger-text {
  color: #c36a44;
}

.table-footer {
  height: 58px;
  padding: 0 16px;
  border-top: 1px solid #eee4d6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 28px;
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
  height: 118px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}

:deep(.carousel-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>

