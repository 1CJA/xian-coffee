<!-- 集点卡管理页面：维护集点规则和兑换记录。 -->
<script setup>
/**
 * 集点卡管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteStampCard, getStampCards, getStampRecords, saveStampCard } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const cards = ref([])
const records = ref([])
const dialogVisible = ref(false)
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const status = ref('')
const storeScope = ref('')

const defaultCard = {
  id: '',
  name: '',
  subtitle: '',
  image: '/admin-assets/member-card.png',
  storeScope: '全部门店',
  target: 10,
  rule: '消费任意饮品 1 杯得 1 点',
  reward: '饮品免单券',
  issuedCount: 0,
  redeemedCount: 0,
  validDays: 30,
  sort: 1,
  status: '启用',
  miniPage: '集点卡页 / 会员中心页',
  updatedAt: ''
}

const form = reactive({ ...defaultCard })
const statusOptions = ['启用', '停用']
const storeOptions = ['全部门店', '望江路店', '南山店', '万象城店', '滨江店', '西溪店']

const filteredCards = computed(() => {
  return cards.value.filter((item) => {
    const key = keyword.value.trim()
    const matchKeyword = !key || [item.name, item.subtitle, item.rule, item.reward, item.miniPage].some((value) => String(value || '').includes(key))
    const matchStatus = !status.value || item.status === status.value
    const matchStore = !storeScope.value || item.storeScope === storeScope.value
    return matchKeyword && matchStatus && matchStore
  }).slice().sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
})

const issuedTotal = computed(() => cards.value.reduce((sum, item) => sum + Number(item.issuedCount || 0), 0))
const redeemedTotal = computed(() => cards.value.reduce((sum, item) => sum + Number(item.redeemedCount || 0), 0))
const activeTotal = computed(() => cards.value.filter((item) => item.status === '启用').length)
const redeemRate = computed(() => issuedTotal.value ? Math.round((redeemedTotal.value / issuedTotal.value) * 100) : 0)
const stampStats = computed(() => [
  { label: '发放总数', value: issuedTotal.value, sub: '小程序集点卡领取', trend: '全部活动', trendClass: 'normal', icon: 'Medal', tone: 'green' },
  { label: '已兑换', value: redeemedTotal.value, sub: '兑换饮品免单券', trend: '兑换完成', trendClass: 'up', icon: 'Ticket', tone: 'khaki' },
  { label: '启用活动', value: activeTotal.value, sub: '集点卡页展示中', trend: '可参与', trendClass: 'up', icon: 'CircleCheck', tone: 'brown' },
  { label: '兑换率', value: `${redeemRate.value}%`, sub: '已兑换 / 已发放', trend: '本月统计', trendClass: 'normal', icon: 'TrendCharts', tone: 'coin' }
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
    const [cardData, recordData] = await Promise.all([getStampCards(), getStampRecords()])
    cards.value = cardData
    records.value = recordData
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
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { ...defaultCard, sort: cards.value.length + 1, updatedAt: currentTime() })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  if (!form.name || !form.reward) {
    ElMessage.warning('请填写活动名称和奖励内容')
    return
  }
  const payload = {
    ...form,
    image: form.image || defaultCard.image,
    target: Number(form.target || 10),
    issuedCount: Number(form.issuedCount || 0),
    redeemedCount: Number(form.redeemedCount || 0),
    validDays: Number(form.validDays || 30),
    sort: Number(form.sort || 1),
    updatedAt: currentTime()
  }
  const saved = await saveStampCard(payload)
  const index = cards.value.findIndex((item) => String(item.id) === String(saved.id))
  if (index >= 0) cards.value.splice(index, 1, saved)
  else cards.value.unshift(saved)
  dialogVisible.value = false
  ElMessage.success('集点卡活动已同步到小程序')
}

/**
 * 转换页面展示格式。
 */
async function toggleStatus(row) {
  const saved = await saveStampCard({ ...row, status: row.status === '启用' ? '停用' : '启用', updatedAt: currentTime() })
  Object.assign(row, saved)
  ElMessage.success(`集点卡活动已${row.status}`)
}


/**
 * 删除当前选中记录。
 */
function deleteCard(row) {
  ElMessageBox.confirm(`确定删除「${row.name}」吗？删除后小程序集点卡页不再展示。`, '删除集点卡活动', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteStampCard(row.id)
    cards.value = cards.value.filter((item) => item.id !== row.id)
    ElMessage.success('集点卡活动已删除')
  }).catch(() => {})
}

/**
 * 处理当前页面业务。
 */
function viewCard(row) {
  ElMessage.info(`${row.name} 同步到 ${row.miniPage}`)
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  status.value = ''
  storeScope.value = ''
}

/**
 * 处理当前页面业务。
 */
function searchCards() {
  ElMessage.success('已按条件筛选集点卡活动')
}

/**
 * 处理当前页面业务。
 */
function progressPercent(row) {
  const issued = Number(row.issuedCount || 0)
  if (!issued) return 0
  return Math.min(Math.round((Number(row.redeemedCount || 0) / issued) * 100), 100)
}

/**
 * 事件处理函数。
 * 响应用户点击、输入或页面交互。
 */
function handleAvatarError(event) {
  event.target.src = '/admin-assets/user-avatar.png'
}

onMounted(loadData)
</script>

<template>
  <!-- 集点卡管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="stamp-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in stampStats" :key="item.label" class="stamp-stat admin-card">
        <div :class="['stat-icon', item.tone]"><el-icon><component :is="item.icon" /></el-icon></div>
        <div class="stat-copy">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.sub }} <em :class="item.trendClass">{{ item.trend }}</em></p>
        </div>
      </div>
    </div>

    <!-- 查询筛选区：输入关键字、选择状态并触发筛选。 -->

    <section class="filter-bar admin-card">
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索集点活动名称 / 奖励" />
      <el-select v-model="status" size="large" clearable placeholder="全部状态" class="filter-select">
        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="storeScope" size="large" clearable placeholder="适用门店" class="filter-select">
        <el-option v-for="item in storeOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <div class="filter-spacer"></div>
      <el-button size="large" type="primary" icon="Search" @click="searchCards">查询</el-button>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button size="large" type="primary" icon="Plus" @click="openDialog()">新增活动</el-button>
    </section>

    <section class="table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredCards" row-key="id" class="stamp-table" empty-text="暂无集点卡活动">
        <el-table-column label="活动信息" min-width="330">
          <template #default="scope">
            <div class="activity-cell">
              <img class="activity-thumb" :src="scope.row.image || defaultCard.image" :alt="scope.row.name" />
              <div class="activity-copy">
                <div class="name-line"><strong>{{ scope.row.name }}</strong><span>{{ scope.row.target }}点</span></div>
                <p>{{ scope.row.subtitle }}</p>
                <em>{{ scope.row.miniPage }}</em>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="适用门店" width="150"><template #default="scope"><span class="store-pill">{{ scope.row.storeScope }}</span></template></el-table-column>
        <el-table-column label="集满规则" min-width="190"><template #default="scope"><div class="rule-cell"><strong>集满 {{ scope.row.target }} 点</strong><span>{{ scope.row.rule }}</span></div></template></el-table-column>
        <el-table-column label="奖励内容" min-width="160"><template #default="scope"><span class="reward-text">{{ scope.row.reward }}</span></template></el-table-column>
        <el-table-column label="发放 / 兑换" width="160">
          <template #default="scope">
            <div class="progress-cell"><div><span>发放 {{ scope.row.issuedCount }}</span><b>兑换 {{ scope.row.redeemedCount }}</b></div><div class="progress-track"><i :style="{ width: `${progressPercent(scope.row)}%` }"></i></div><small>兑换率 {{ progressPercent(scope.row) }}%</small></div>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="112"><template #default="scope"><span class="plain-text">{{ scope.row.validDays }} 天</span></template></el-table-column>
        <el-table-column label="更新时间" width="158"><template #default="scope"><span class="plain-text">{{ scope.row.updatedAt }}</span></template></el-table-column>
        <el-table-column label="状态" width="96"><template #default="scope"><StatusTag :status="scope.row.status" /></template></el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="viewCard(scope.row)">查看</el-button>
              <el-button size="small" type="primary" plain @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" plain @click.stop="toggleStatus(scope.row)">{{ scope.row.status === '启用' ? '停用' : '启用' }}</el-button>

              <el-button size="small" type="danger" plain @click.stop="deleteCard(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer"><span>共 {{ filteredCards.length }} 条活动</span><div class="pager-mock"><button>‹</button><strong>1</strong><button>›</button><em>10 条/页</em></div></div>
    </section>

    <section class="record-card admin-card">
      <div class="section-head"><div><h3>最近兑换记录</h3><p>对应后端 stamp_record，记录会员集点兑换饮品免单券。</p></div><span>集点卡页 / 会员中心页</span></div>
      <el-table :data="records" row-key="id" class="record-table" empty-text="暂无兑换记录">
        <el-table-column label="会员信息" min-width="240">
          <template #default="scope"><div class="member-cell"><img class="member-avatar" :src="scope.row.avatar" :alt="scope.row.memberName" @error="handleAvatarError" /><div><strong>{{ scope.row.memberName }}</strong><p>{{ scope.row.phone }}</p></div></div></template>
        </el-table-column>
        <el-table-column prop="activityName" label="集点卡活动" min-width="190" />
        <el-table-column prop="reward" label="兑换内容" min-width="150" />
        <el-table-column prop="storeName" label="兑换门店" min-width="180" />
        <el-table-column prop="redeemedAt" label="兑换时间" width="160" />
        <el-table-column label="状态" width="100"><template #default="scope"><StatusTag :status="scope.row.status" /></template></el-table-column>
      </el-table>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="集点卡活动信息" width="760px" class="stamp-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form :model="form" label-width="104px">
        <div class="dialog-layout">
          <div class="image-preview"><img :src="form.image || defaultCard.image" alt="集点卡预览" /><span>小程序集点卡图</span></div>
          <div class="form-grid">
            <el-form-item label="活动名称"><el-input v-model="form.name" placeholder="例如 买一杯得一点" /></el-form-item>
            <el-form-item label="适用门店"><el-select v-model="form.storeScope" style="width: 100%"><el-option v-for="item in storeOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
            <el-form-item label="活动副标题" class="full-line"><el-input v-model="form.subtitle" placeholder="显示在后台活动说明中" /></el-form-item>
            <el-form-item label="集满点数"><el-input-number v-model="form.target" :min="1" :max="10" style="width: 100%" /></el-form-item>
            <el-form-item label="有效天数"><el-input-number v-model="form.validDays" :min="1" style="width: 100%" /></el-form-item>
            <el-form-item label="发放数量"><el-input-number v-model="form.issuedCount" :min="0" style="width: 100%" /></el-form-item>
            <el-form-item label="兑换数量"><el-input-number v-model="form.redeemedCount" :min="0" style="width: 100%" /></el-form-item>
            <el-form-item label="集点规则" class="full-line"><el-input v-model="form.rule" placeholder="例如 消费任意饮品 1 杯得 1 点" /></el-form-item>
            <el-form-item label="奖励内容"><el-input v-model="form.reward" placeholder="例如 饮品免单券" /></el-form-item>
            <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" style="width: 100%" /></el-form-item>
            <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="启用" /><el-radio-button label="停用" /></el-radio-group></el-form-item>
            <el-form-item label="活动图片" class="full-line"><el-input v-model="form.image" placeholder="可填写 /admin-assets/member-card.png 或后端图片 URL" /></el-form-item>
            <el-form-item label="同步页面" class="full-line"><el-input v-model="form.miniPage" /></el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitForm">保存并同步</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
/* 集点卡管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.stamp-page { gap: 22px; }
/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; }
.stamp-stat { height: 132px; padding: 26px 30px; display: flex; align-items: center; gap: 24px; border: 0; border-radius: 6px; background: rgba(255,255,255,.78); box-shadow: 0 14px 34px rgba(116,93,58,.06); }
.stat-icon { width: 70px; height: 70px; border-radius: 50%; display: grid; place-items: center; font-size: 34px; }
.stat-icon.green { background: #eef4e5; color: #738052; }
.stat-icon.khaki, .stat-icon.brown, .stat-icon.coin { background: #fbf3e8; color: #9a6f41; }
.stat-copy span { color: #4e4a42; font-size: 15px; }
.stat-copy strong { display: block; margin: 8px 0 6px; color: #252621; font-size: 30px; line-height: 36px; font-weight: 900; }
.stat-copy p { margin: 0; color: #8a8275; font-size: 13px; }
.stat-copy em { margin-left: 10px; font-style: normal; font-weight: 900; }
.stat-copy em.up { color: #4f8b47; }
.stat-copy em.normal { color: #7a6f63; }
/* 筛选栏：控制查询条件和按钮的横向排版。 */
.filter-bar { min-height: 78px; padding: 18px 26px; display: flex; align-items: center; gap: 18px; border: 0; border-radius: 6px; background: rgba(255,255,255,.78); box-shadow: 0 14px 34px rgba(116,93,58,.06); overflow-x: auto; }
.filter-search { width: 320px; flex: 0 0 320px; }
.filter-select { width: 160px; flex: 0 0 160px; }
.filter-spacer { flex: 1; min-width: 12px; }
.reset-btn { color: #6f675c; }
/* 表格卡片：控制表格容器的背景和圆角。 */
.table-card, .record-card { padding: 0; overflow: hidden; border-radius: 6px; background: rgba(255,255,255,.78); box-shadow: 0 14px 34px rgba(116,93,58,.06); }
.activity-cell, .member-cell { display: flex; align-items: center; gap: 16px; }
.activity-thumb { width: 86px; height: 72px; border-radius: 6px; object-fit: cover; background: #f7efe3; border: 1px solid #eadcc8; }
.activity-copy { min-width: 0; }
.name-line { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
.name-line strong, .member-cell strong { color: #2f312b; font-size: 16px; }
.name-line strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.name-line span, .store-pill { height: 22px; padding: 0 8px; border-radius: 999px; background: #eef4e5; color: #596847; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; white-space: nowrap; flex: 0 0 auto; }
.store-pill { height: 28px; padding: 0 12px; background: #f1e2cc; color: #9a6a38; font-size: 13px; }
.activity-copy p { max-width: 260px; margin: 7px 0 4px; overflow: hidden; color: #736b60; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.activity-copy em, .plain-text, .member-cell p { color: #a19789; font-size: 12px; font-style: normal; }
.member-cell p { margin: 6px 0 0; }
.member-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #f7efe3; border: 2px solid #eadcc8; flex: 0 0 48px; display: block; }
.rule-cell { display: flex; flex-direction: column; gap: 6px; }
.rule-cell strong, .reward-text { color: #26311f; font-size: 15px; font-weight: 900; }
.rule-cell span { color: #736b60; font-size: 13px; }
.progress-cell div:first-child { display: flex; align-items: center; justify-content: space-between; color: #81796d; font-size: 12px; }
.progress-cell b { color: #2f312b; font-size: 13px; }
.progress-track { height: 6px; margin: 7px 0 6px; border-radius: 999px; background: #eee4d6; overflow: hidden; }
.progress-track i { display: block; height: 100%; border-radius: inherit; background: #758256; }
.progress-cell small { color: #998f81; font-size: 12px; }
/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons { display: flex; justify-content: flex-start; gap: 6px; white-space: nowrap; }
:deep(.action-buttons .el-button + .el-button) { margin-left: 0; }
:deep(.action-buttons .el-button) { padding-left: 9px; padding-right: 9px; }
.table-footer { height: 58px; padding: 0 16px; border-top: 1px solid #eee4d6; display: flex; align-items: center; justify-content: space-between; color: #7e7568; font-size: 13px; }
.pager-mock { display: flex; align-items: center; gap: 14px; }
.pager-mock button, .pager-mock strong { width: 30px; height: 30px; border: 1px solid #dfd3c2; border-radius: 6px; background: #fffdf8; color: #7e7568; }
.pager-mock strong { background: #667452; color: #fffaf1; display: grid; place-items: center; }
.pager-mock em { font-style: normal; }
.section-head { min-height: 82px; padding: 20px 26px; border-bottom: 1px solid #eee4d6; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.section-head h3 { margin: 0; color: #24251f; font-size: 18px; }
.section-head p { margin: 8px 0 0; color: #8a8275; font-size: 13px; }
.section-head span { color: #667452; font-size: 13px; font-weight: 900; white-space: nowrap; }
/* 弹窗样式：控制编辑表单和预览区域布局。 */
.dialog-layout { display: grid; grid-template-columns: 180px 1fr; gap: 24px; align-items: flex-start; }
.image-preview { min-height: 216px; padding: 16px; border: 1px solid rgba(213,201,181,.68); border-radius: 8px; background: #fffaf1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.image-preview img { width: 132px; height: 132px; border-radius: 8px; object-fit: cover; }
.image-preview span { color: #7a7164; font-size: 13px; }
/* 表单样式：控制输入项排列和宽度。 */
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 20px; }
.full-line { grid-column: 1 / -1; }
:deep(.el-table th.el-table__cell) { height: 50px; background: #f7efdf; color: #5d564c; font-weight: 900; }
:deep(.el-table td.el-table__cell) { height: 102px; color: #403c35; }
:deep(.record-table td.el-table__cell) { height: 78px; }
:deep(.el-table__row:hover > td.el-table__cell) { background: #fbf4e7; }
:deep(.stamp-dialog .el-dialog) { border-radius: 8px; background: #fffaf1; }
</style>
