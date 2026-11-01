<!-- 分类管理页面：维护小程序菜单分类数据。 -->
<script setup>
/**
 * 分类管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCategory as deleteCategoryApi, getCategories, saveCategory } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const categories = ref([])
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const status = ref('')
const dialogVisible = ref(false)
const formRef = ref()

const defaultCategory = {
  id: '',
  name: '',
  sort: 1,
  status: '启用',
  productCount: 0,
  page: '菜单点单页',
  desc: ''
}

const form = reactive({ ...defaultCategory })

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const filteredCategories = computed(() => {
  return categories.value
    .filter((item) => {
      const matchKeyword = !keyword.value || item.name.includes(keyword.value) || item.desc.includes(keyword.value) || item.page.includes(keyword.value)
      const matchStatus = !status.value || item.status === status.value
      return matchKeyword && matchStatus
    })
    .slice()
    .sort((a, b) => Number(a.sort) - Number(b.sort))
})

const enabledCount = computed(() => categories.value.filter((item) => item.status === '启用').length)
const disabledCount = computed(() => categories.value.filter((item) => item.status !== '启用').length)
const productTotal = computed(() => categories.value.reduce((sum, item) => sum + Number(item.productCount || 0), 0))

const categoryStats = computed(() => [
  { label: '分类总数', value: categories.value.length, sub: '小程序菜单', trend: '当前分类', trendClass: 'normal', icon: 'Grid', tone: 'green' },
  { label: '启用分类', value: enabledCount.value, sub: '菜单展示', trend: '启用中', trendClass: 'up', icon: 'CircleCheck', tone: 'khaki' },
  { label: '停用分类', value: disabledCount.value, sub: '暂不展示', trend: '可恢复', trendClass: 'down', icon: 'Remove', tone: 'brown' },
  { label: '分类商品数', value: productTotal.value, sub: '已绑定商品', trend: '菜单数据', trendClass: 'up', icon: 'ShoppingBag', tone: 'coin' }
])

watch(keyword, () => {
  if (keyword.value.length > 12) keyword.value = keyword.value.slice(0, 12)
})

/**
 * 加载页面数据。
 * 从后端接口或本地数据源获取页面所需内容。
 */
async function loadData() {
  loading.value = true
  try {
    categories.value = await getCategories()
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { ...defaultCategory, sort: categories.value.length + 1 })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  await formRef.value.validate()
  const saved = await saveCategory({ ...form })
  const index = categories.value.findIndex((item) => String(item.id) === String(saved.id))
  if (index >= 0) categories.value.splice(index, 1, saved)
  else categories.value.push(saved)
  categories.value = await getCategories()
  dialogVisible.value = false
  ElMessage.success('分类已同步到商品管理和小程序菜单页')
}
/**
 * 转换页面展示格式。
 */
async function toggleStatus(row) {
  const saved = await saveCategory({ ...row, status: row.status === '启用' ? '停用' : '启用' })
  Object.assign(row, saved)
  ElMessage.success(`分类已${row.status}，商品管理分类下拉已同步`)
}
/**
 * 删除当前选中记录。
 */
function deleteCategory(row) {
  const tip = Number(row.productCount || 0) > 0
    ? `该分类下有 ${row.productCount} 款商品，删除后这些商品会同步变为“未分类”。确定删除「${row.name}」吗？`
    : `确定删除「${row.name}」分类吗？删除后当前分类列表将不再展示。`
  ElMessageBox.confirm(tip, '删除分类', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteCategoryApi(row.id)
    categories.value = await getCategories()
    ElMessage.success('分类已删除，相关商品分类已同步')
  }).catch(() => {})
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  status.value = ''
}

onMounted(loadData)
</script>

<template>
  <!-- 分类管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="category-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in categoryStats" :key="item.label" class="category-stat admin-card">
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
        <el-option label="启用" value="启用" />
        <el-option label="停用" value="停用" />
      </el-select>
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索分类名称" />
      <div class="filter-spacer"></div>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button type="primary" size="large" icon="Plus" @click="openDialog()">新增分类</el-button>
    </section>

    <section class="category-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredCategories" row-key="id" class="category-table" empty-text="暂无分类数据">
        <el-table-column label="分类信息" min-width="300">
          <template #default="scope">
            <div class="category-cell">
              <div class="category-icon">{{ scope.row.name.slice(0, 1) }}</div>
              <div class="category-copy">
                <div class="name-line">
                  <strong>{{ scope.row.name }}</strong>
                  <span>{{ scope.row.id }}</span>
                </div>
                <p>{{ scope.row.desc }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="排序" width="110">
          <template #default="scope">
            <span class="sort-pill">{{ scope.row.sort }}</span>
          </template>
        </el-table-column>

        <el-table-column label="商品数量" width="140">
          <template #default="scope">
            <strong class="count-text">{{ scope.row.productCount }}</strong>
            <span class="count-unit">款商品</span>
          </template>
        </el-table-column>

        <el-table-column label="小程序页面" min-width="180">
          <template #default="scope">
            <span class="sync-tag">{{ scope.row.page }}</span>
          </template>
        </el-table-column>

        <el-table-column label="说明" min-width="220">
          <template #default="scope">
            <span class="desc-text">{{ scope.row.desc }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" type="primary" plain @click="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" plain @click="toggleStatus(scope.row)">{{ scope.row.status === '启用' ? '停用' : '启用' }}</el-button>
              <el-button size="small" type="danger" plain @click="deleteCategory(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="菜单分类信息" width="560px" class="category-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="分类名称" prop="name"><el-input v-model="form.name" placeholder="例如 咖啡" /></el-form-item>
        <el-form-item label="分类标识"><el-input v-model="form.id" placeholder="例如 coffee，新增可留空" /></el-form-item>
        <el-form-item label="排序" prop="sort"><el-input-number v-model="form.sort" :min="1" style="width: 100%" /></el-form-item>
        <el-form-item label="商品数量"><el-input-number v-model="form.productCount" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="小程序页面"><el-input v-model="form.page" placeholder="菜单点单页" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="启用" /><el-radio-button label="停用" /></el-radio-group></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.desc" type="textarea" :rows="3" placeholder="显示在后台分类说明中" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存并同步</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
/* 分类管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.category-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.category-stat {
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
  width: 180px;
}

.filter-search {
  width: 300px;
}

.filter-spacer {
  flex: 1;
}

.reset-btn {
  color: #6f675c;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
.category-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.category-table {
  border-radius: 6px;
  overflow: hidden;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #eef4e5;
  color: #667452;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 900;
}

.category-copy {
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

.category-copy p,
.desc-text {
  color: #736b60;
  font-size: 13px;
}

.category-copy p {
  margin: 7px 0 0;
}

.sort-pill {
  width: 34px;
  height: 28px;
  border-radius: 999px;
  background: #eef4e5;
  color: #596847;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.count-text {
  color: #26311f;
  font-size: 18px;
}

.count-unit {
  margin-left: 6px;
  color: #8d8478;
  font-size: 12px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-table th.el-table__cell) {
  height: 50px;
  background: #f7efdf;
  color: #5d564c;
  font-weight: 900;
}

:deep(.el-table td.el-table__cell) {
  height: 90px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}

:deep(.category-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>
