<!-- 商品管理页面：维护商品、图片、分类和规格。 -->
<script setup>
/**
 * 商品管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteBackendProduct as deleteProductApi, getBackendCategories as getCategories, getBackendProducts as getProducts, getBackendSpecs as getSpecs, saveBackendProduct as saveProduct, uploadBackendImage } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const category = ref('')
const status = ref('')
// 商品数据：保存当前页面展示的商品列表。
const products = ref([])
const categories = ref([])
const specGroups = ref([])

const fallbackSpecGroups = [
  { id: 'temperature', name: '温度', options: ['热', '温', '冰'], required: true },
  { id: 'cup', name: '杯型', options: ['中杯', '大杯 +4', '超大杯 +6'], required: true },
  { id: 'sugar', name: '糖度', options: ['无糖', '少糖', '半糖', '标准糖'], required: true },
  { id: 'extra', name: '加料', options: ['不加料', '燕麦奶 +3', '香草糖浆 +3', '椰乳 +3', '奶盖 +4', '浓缩 +5'], required: false }
]

const specGroupOptions = computed(() => (specGroups.value.length ? specGroups.value : fallbackSpecGroups).map((item) => ({
  key: item.id,
  label: item.name,
  options: Array.isArray(item.options) ? item.options : [],
  required: Boolean(item.required)
})))

const defaultProduct = {
  id: '',
  name: '',
  categoryId: '',
  categoryName: '',
  price: 0,
  stock: 0,
  sales: 0,
  tag: '',
  image: 'http://localhost:2544/images/menu/latte.png',
  imagePath: 'admin/menu/latte.png',
  detailImagePath: 'admin/product-detail/main-coffee.png',
  status: '上架',
  desc: '',
  miniPage: '菜单点单页 / 商品详情页 / 搜索页',
  specs: '温度、杯型、糖度、加料',
  specOptions: {}
}

const form = reactive({ ...defaultProduct, specOptions: createDefaultSpecOptions() })

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }]
}

const filteredProducts = computed(() => {
  return products.value.filter((item) => {
    const matchKeyword = !keyword.value || [item.name, item.desc, item.tag, item.categoryName, item.miniPage].some((value) => String(value || '').includes(keyword.value))
    const matchCategory = !category.value || item.categoryId === category.value
    const matchStatus = !status.value || item.status === status.value
    return matchKeyword && matchCategory && matchStatus
  })
})

const onlineCount = computed(() => products.value.filter((item) => item.status === '上架').length)
const offlineCount = computed(() => products.value.filter((item) => item.status === '下架').length)
const stockTotal = computed(() => products.value.reduce((sum, item) => sum + Number(item.stock || 0), 0))
const productValue = computed(() => products.value.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.stock || 0), 0))

const productStats = computed(() => [
  { label: '商品总数', value: products.value.length, sub: '菜单与搜索页', trend: '实时数据', trendClass: 'normal', icon: 'ShoppingBag', tone: 'green' },
  { label: '上架商品', value: onlineCount.value, sub: '小程序可见', trend: '正在销售', trendClass: 'up', icon: 'Box', tone: 'khaki' },
  { label: '下架商品', value: offlineCount.value, sub: '暂不展示', trend: '可恢复', trendClass: 'down', icon: 'TakeawayBox', tone: 'brown' },
  { label: '库存总价值', value: `¥${productValue.value.toLocaleString()}`, sub: `${stockTotal.value} 件库存`, trend: '商品资产', trendClass: 'up', icon: 'Money', tone: 'coin' }
])

/**
 * 生成默认表单数据。
 */
function createDefaultSpecOptions() {
  const options = {}
  specGroupOptions.value.forEach((group) => {
    options[group.key] = group.required ? [...group.options] : []
  })
  return options
}

/**
 * 整理后端字段给页面使用。
 */
function normalizeSpecOptions(product = {}) {
  const nextOptions = createDefaultSpecOptions()
  if (product.specOptions) {
    specGroupOptions.value.forEach((group) => {
      nextOptions[group.key] = Array.isArray(product.specOptions[group.key]) ? [...product.specOptions[group.key]] : []
    })
    return nextOptions
  }

  const selectedGroups = String(product.specs || '').split('、').map((item) => item.trim()).filter(Boolean)
  specGroupOptions.value.forEach((group) => {
    if (selectedGroups.includes(group.label)) {
      nextOptions[group.key] = [...group.options]
      return
    }
    const matchedOptions = group.options.filter((option) => {
      const text = String(option).split(' ')[0]
      return selectedGroups.includes(option) || selectedGroups.includes(text)
    })
    nextOptions[group.key] = matchedOptions
  })
  return nextOptions
}

/**
 * 生成默认表单数据。
 */
function buildSpecSummary(specOptions) {
  const labels = specGroupOptions.value
    .filter((group) => specOptions?.[group.key]?.length)
    .map((group) => group.label)
  return labels.length ? labels.join('、') : '经典口味'
}

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
    const [productData, categoryData, specData] = await Promise.all([getProducts(), getCategories(), getSpecs()])
    products.value = productData
    categories.value = categoryData
    specGroups.value = specData
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  const nextProduct = { ...defaultProduct, ...(row || {}) }
  nextProduct.specOptions = normalizeSpecOptions(nextProduct)
  nextProduct.specs = buildSpecSummary(nextProduct.specOptions)
  Object.assign(form, nextProduct)
  dialogVisible.value = true
}

/**
 * 处理当前页面业务。
 */
async function refreshCategories() {
  categories.value = await getCategories()
}

/**
 * 处理当前页面业务。
 */
function categoryOptionLabel(item) {
  return item.status === '启用' ? item.name : `${item.name}（已停用）`
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  await formRef.value.validate()
  const selected = categories.value.find((item) => item.id === form.categoryId)
  if (selected?.status !== '启用') {
    ElMessage.warning('该分类已停用，请先启用分类或选择其它分类')
    return
  }
  form.categoryName = selected?.name || form.categoryName
  form.specs = buildSpecSummary(form.specOptions)
  const saved = await saveProduct({
    ...form,
    image: form.image || defaultProduct.image,
    imagePath: form.imagePath || defaultProduct.imagePath,
    detailImagePath: form.detailImagePath || form.imagePath || defaultProduct.detailImagePath,
    specOptions: JSON.parse(JSON.stringify(form.specOptions))
  })
  const index = products.value.findIndex((item) => String(item.id) === String(saved.id))
  if (index >= 0) products.value.splice(index, 1, saved)
  else products.value.unshift(saved)
  await refreshCategories()
  dialogVisible.value = false
  ElMessage.success('商品信息已同步到菜单、搜索和商品详情页')
}

/**
 * 转换页面展示格式。
 */
async function toggleStatus(row) {
  const nextStatus = row.status === '上架' ? '下架' : '上架'
  const saved = await saveProduct({ ...row, status: nextStatus })
  Object.assign(row, saved)
  ElMessage.success(`小程序商品已${row.status}`)
}

/**
 * 删除当前选中记录。
 */
function deleteProduct(row) {
  ElMessageBox.confirm(`确定删除「${row.name}」吗？删除后菜单、搜索和商品详情页将不再展示。`, '删除商品', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteProductApi(row.id)
    products.value = products.value.filter((item) => item.id !== row.id)
    await refreshCategories()
    ElMessage.success('商品已从当前列表删除，分类商品数已同步')
  }).catch(() => {})
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  category.value = ''
  status.value = ''
}
/**
 * 事件处理函数。
 * 响应用户点击、输入或页面交互。
 */
async function handleImageUpload(option) {
  try {
    const result = await uploadBackendImage(option.file)
    form.image = result.url
    form.imagePath = result.imagePath
    if (!form.detailImagePath) form.detailImagePath = result.imagePath
    ElMessage.success('图片已上传到后端')
    option.onSuccess?.(result)
  } catch (error) {
    option.onError?.(error)
  }
}

/**
 * 处理当前页面业务。
 */
function previewMiniProgram(row) {
  router.push(`/products/${row.id}`)
}

/**
 * 处理当前页面业务。
 */
function stockPercent(row) {
  return Math.min(Math.round((Number(row.stock || 0) / 120) * 100), 100)
}

onMounted(loadData)
</script>

<template>
  <!-- 商品管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="product-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in productStats" :key="item.label" class="product-stat admin-card">
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
      <el-select v-model="category" size="large" clearable placeholder="全部分类" class="filter-select">
        <el-option v-for="item in categories" :key="item.id" :label="categoryOptionLabel(item)" :value="item.id" :disabled="item.status !== '启用'" />
      </el-select>
      <el-select v-model="status" size="large" clearable placeholder="全部状态" class="filter-select">
        <el-option label="上架" value="上架" />
        <el-option label="下架" value="下架" />
      </el-select>
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索商品名称" />
      <div class="filter-spacer"></div>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button type="primary" size="large" icon="Plus" @click="openDialog()">新增商品</el-button>
    </section>

    <section class="product-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredProducts" row-key="id" class="product-table" empty-text="暂无商品数据">
        <el-table-column label="商品信息" min-width="310">
          <template #default="scope">
            <div class="product-cell">
              <img class="product-thumb" :src="scope.row.image || defaultProduct.image" :alt="scope.row.name" />
              <div class="product-name">
                <div class="name-line">
                  <strong>{{ scope.row.name }}</strong>
                  <span v-if="scope.row.tag">{{ scope.row.tag }}</span>
                </div>
                <p>{{ scope.row.desc }}</p>
                <em>{{ scope.row.id }}</em>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="112">
          <template #default="scope">
            <span class="category-pill">{{ scope.row.categoryName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="详情规格" min-width="205">
          <template #default="scope">
            <div class="spec-list">
              <span v-for="item in scope.row.specs.split('、')" :key="item">{{ item }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="同步小程序页面" min-width="220">
          <template #default="scope">
            <span class="sync-tag">{{ scope.row.miniPage }}</span>
          </template>
        </el-table-column>

        <el-table-column label="价格" width="100">
          <template #default="scope">
            <strong class="price-text">¥{{ scope.row.price }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="库存 / 销量" width="156">
          <template #default="scope">
            <div class="stock-box">
              <div><span>库存</span><b>{{ scope.row.stock }}</b></div>
              <div class="stock-track"><i :style="{ width: `${stockPercent(scope.row)}%` }"></i></div>
              <small>销量 {{ scope.row.sales || 0 }}</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="96">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="previewMiniProgram(scope.row)">详情</el-button>
              <el-button size="small" type="primary" plain @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" plain @click.stop="toggleStatus(scope.row)">{{ scope.row.status === '上架' ? '下架' : '上架' }}</el-button>
              <el-button size="small" type="danger" plain @click.stop="deleteProduct(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="小程序商品信息" width="760px" class="product-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form ref="formRef" :model="form" :rules="rules" label-width="104px">
        <div class="dialog-layout">
          <div class="image-preview">
            <img :src="form.image || defaultProduct.image" alt="商品预览" />
            <span>小程序商品图</span>
          </div>
          <div class="form-grid">
            <el-form-item label="商品名称" prop="name"><el-input v-model="form.name" placeholder="例如 栖岸拿铁" /></el-form-item>
            <el-form-item label="商品分类" prop="categoryId"><el-select v-model="form.categoryId" style="width: 100%"><el-option v-for="item in categories" :key="item.id" :label="categoryOptionLabel(item)" :value="item.id" :disabled="item.status !== '启用'" /></el-select></el-form-item>
            <el-form-item label="价格" prop="price"><el-input-number v-model="form.price" :min="0" style="width: 100%" /></el-form-item>
            <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width: 100%" /></el-form-item>
            <el-form-item label="商品图片" class="full-line">
              <div class="image-input-row">
                <el-input v-model="form.image" placeholder="上传图片后自动生成后端URL，也可填写后端图片URL" />
                <el-upload :show-file-list="false" :http-request="handleImageUpload" accept="image/*">
                  <el-button type="primary" plain>上传图片</el-button>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="规格设置" class="full-line spec-config-field">
              <div class="spec-config">
                <div v-for="group in specGroupOptions" :key="group.key" class="spec-config-row">
                  <div class="spec-config-label">{{ group.label }}</div>
                  <el-checkbox-group v-model="form.specOptions[group.key]">
                    <el-checkbox-button v-for="option in group.options" :key="option" :label="option" />
                  </el-checkbox-group>
                </div>
                <p>当前规格摘要：{{ buildSpecSummary(form.specOptions) }}</p>
              </div>
            </el-form-item>
            <el-form-item label="同步页面"><el-input v-model="form.miniPage" /></el-form-item>
            <el-form-item label="标签"><el-input v-model="form.tag" placeholder="人气 / 新品 / 推荐" /></el-form-item>
            <el-form-item label="状态"><el-select v-model="form.status" style="width: 100%"><el-option label="上架" value="上架" /><el-option label="下架" value="下架" /></el-select></el-form-item>
            <el-form-item label="描述" class="full-line"><el-input v-model="form.desc" type="textarea" :rows="3" placeholder="显示在小程序商品卡片和详情页" /></el-form-item>
          </div>
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
/* 商品管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
/* 商品区域：控制商品图片、信息、价格和按钮。 */
.product-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.product-stat {
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
.product-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.product-table {
  border-radius: 6px;
  overflow: hidden;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-thumb {
  width: 82px;
  height: 72px;
  border-radius: 6px;
  object-fit: contain;
  background: #f7efe3;
  border: 1px solid #eadcc8;
}

.product-name {
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

.product-name p {
  max-width: 260px;
  margin: 7px 0 4px;
  overflow: hidden;
  color: #736b60;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name em {
  color: #a19789;
  font-size: 12px;
  font-style: normal;
}

.category-pill {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef4e5;
  color: #596847;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.spec-list span {
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgba(184, 173, 116, 0.32);
  border-radius: 999px;
  background: rgba(255, 250, 239, 0.86);
  color: #756b43;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}

.price-text {
  color: #26311f;
  font-size: 17px;
}

.stock-box div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #81796d;
  font-size: 12px;
}

.stock-box b {
  color: #2f312b;
  font-size: 13px;
}

.stock-track {
  height: 6px;
  margin: 7px 0 6px;
  border-radius: 999px;
  background: #eee4d6;
  overflow: hidden;
}

.stock-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #758256;
}

.stock-box small {
  color: #998f81;
  font-size: 12px;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* 弹窗样式：控制编辑表单和预览区域布局。 */
.dialog-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 24px;
  align-items: flex-start;
}

.image-preview {
  min-height: 216px;
  padding: 16px;
  border: 1px solid rgba(213, 201, 181, 0.68);
  border-radius: 8px;
  background: #fffaf1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.image-preview img {
  width: 132px;
  height: 132px;
  object-fit: contain;
}

.image-preview span {
  color: #7a7164;
  font-size: 13px;
}

.spec-config-field {
  margin-bottom: 18px;
}
.image-input-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-input-row .el-input {
  flex: 1;
}

.spec-config {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5d8c8;
  border-radius: 6px;
  background: #fffaf1;
}

.spec-config-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.spec-config-row:last-of-type {
  margin-bottom: 8px;
}

.spec-config-label {
  color: #4e4a42;
  font-size: 14px;
  font-weight: 900;
}

.spec-config p {
  margin: 8px 0 0;
  color: #7a7164;
  font-size: 13px;
}

:deep(.spec-config .el-checkbox-button__inner) {
  margin: 0 8px 8px 0;
  border: 1px solid #dacbb8;
  border-radius: 999px !important;
  background: #fffdf8;
  color: #675f54;
  box-shadow: none;
}

:deep(.spec-config .el-checkbox-button.is-checked .el-checkbox-button__inner) {
  border-color: #667452;
  background: #667452;
  color: #fffaf1;
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

:deep(.product-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>
