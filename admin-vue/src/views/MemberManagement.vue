<!-- 会员管理页面：维护会员资料、积分和集点。 -->
<script setup>
/**
 * 会员管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteMember as deleteMemberApi, getMembers, redeemMemberStamp, saveMember } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
// 会员数据：保存后台会员管理列表。
const members = ref([])
const dialogVisible = ref(false)
// 搜索关键字：用于筛选列表数据。
const keyword = ref('')
const level = ref('')
const status = ref('')
const redeemingIds = ref([])

const STAMP_LIMIT = 10
const REDEEM_COUPON_DAYS = 5

const today = () => new Date().toISOString().slice(0, 10)

const defaultMember = {
  id: '',
  memberNo: '',
  avatar: '/admin-assets/user-avatar.png',
  nickname: '',
  phone: '',
  level: '普通会员',
  points: 0,
  stamps: 0,
  redeemCount: 0,
  coupons: 0,
  couponList: [],
  balance: 0,
  orders: 0,
  totalAmount: 0,
  registerTime: today(),
  status: '正常',
  miniPage: '个人中心页 / 会员中心页'
}

const form = reactive({ ...defaultMember })

const levelOptions = ['普通会员', 'VIP', '金卡会员', '钻石会员']
const statusOptions = ['正常', '冻结']

const activeCount = computed(() => members.value.filter((item) => item.status === '正常').length)
const vipCount = computed(() => members.value.filter((item) => item.level !== '普通会员').length)
const pointsTotal = computed(() => members.value.reduce((sum, item) => sum + Number(item.points || 0), 0))
const stampsTotal = computed(() => members.value.reduce((sum, item) => sum + clampStamp(item.stamps), 0))

const memberStats = computed(() => [
  { label: '会员总数', value: members.value.length, sub: '个人中心页用户', trend: '全部会员', trendClass: 'normal', icon: 'UserFilled', tone: 'green' },
  { label: 'VIP会员', value: vipCount.value, sub: '会员中心页权益', trend: '高价值用户', trendClass: 'up', icon: 'Medal', tone: 'khaki' },
  { label: '活跃会员', value: activeCount.value, sub: '可正常下单', trend: '状态正常', trendClass: 'up', icon: 'CircleCheck', tone: 'brown' },
  { label: '积分总额', value: pointsTotal.value, sub: `${stampsTotal.value} 个集点`, trend: '积分资产', trendClass: 'normal', icon: 'Coin', tone: 'coin' }
])

const filteredMembers = computed(() => {
  return members.value.filter((item) => {
    const key = keyword.value.trim()
    const matchKeyword = !key || [item.nickname, item.phone, item.memberNo, item.miniPage].some((value) => String(value || '').includes(key))
    const matchLevel = !level.value || item.level === level.value
    const matchStatus = !status.value || item.status === status.value
    return matchKeyword && matchLevel && matchStatus
  })
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
    const data = await getMembers()
    members.value = data.map((item) => normalizeMember(item))
  } finally {
    loading.value = false
  }
}

/**
 * 整理后端字段给页面使用。
 */
function normalizeMember(item) {
  const couponList = Array.isArray(item.couponList) ? item.couponList : []
  return {
    ...defaultMember,
    ...item,
    stamps: clampStamp(item.stamps),
    redeemCount: Number(item.redeemCount || 0),
    couponList,
    coupons: Math.max(Number(item.coupons || 0), couponList.length)
  }
}

/**
 * 处理当前页面业务。
 */
function clampStamp(value) {
  const number = Number(value || 0)
  if (number < 0) return 0
  if (number > STAMP_LIMIT) return STAMP_LIMIT
  return number
}


/**
 * 处理当前页面业务。
 */
function isRedeeming(row) {
  return redeemingIds.value.some((id) => String(id) === String(row.id))
}
/**
 * 处理当前页面业务。
 */
function couponRecords(row) {
  return Array.isArray(row?.couponList) ? row.couponList : []
}

/**
 * 处理当前页面业务。
 */
function couponCount(row) {
  return Math.max(Number(row?.coupons || 0), couponRecords(row).length)
}

/**
 * 处理当前页面业务。
 */
function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
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
 * 处理当前页面业务。
 */
function memberNo(row) {
  return row.memberNo || `QC${String(row.id || 0).padStart(6, '0')}`
}

/**
 * 生成默认表单数据。
 */
function createMemberNo() {
  return `QC${Date.now().toString().slice(-6)}`
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  const source = row ? normalizeMember(row) : { ...defaultMember, registerTime: today() }
  Object.assign(form, source, { couponList: [...source.couponList] })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  if (!form.nickname || !form.phone) {
    ElMessage.warning('请填写会员昵称和手机号')
    return
  }
  const payload = normalizeMember({
    ...form,
    memberNo: form.memberNo || createMemberNo(),
    avatar: form.avatar || defaultMember.avatar,
    stamps: clampStamp(form.stamps),
    miniPage: form.miniPage || defaultMember.miniPage
  })
  const saved = await saveMember(payload)
  const next = normalizeMember(saved)
  const index = members.value.findIndex((item) => String(item.id) === String(next.id))
  if (index >= 0) members.value.splice(index, 1, next)
  else members.value.unshift(next)
  dialogVisible.value = false
  ElMessage.success('会员信息已同步到小程序')
}

/**
 * 重置筛选或表单内容。
 */
function resetFilters() {
  keyword.value = ''
  level.value = ''
  status.value = ''
}

/**
 * 处理当前页面业务。
 */
function searchMembers() {
  ElMessage.success('已按条件筛选会员')
}

/**
 * 处理当前页面业务。
 */
function viewMember(row) {
  ElMessage.info(`${row.nickname} 会展示在小程序个人中心和会员中心`)
}


/**
 * 处理当前页面业务。
 */
async function redeemStamp(row) {
  if (clampStamp(row.stamps) < STAMP_LIMIT) {
    ElMessage.warning('集满10点后才可以兑换饮品免单券')
    return
  }
  if (isRedeeming(row)) return

  redeemingIds.value = [...redeemingIds.value, row.id]
  try {
    const saved = await redeemMemberStamp(row.id)
    Object.assign(row, normalizeMember(saved))
    ElMessage.success('已发放饮品免单券，集点已清零，兑换次数已增加')
  } finally {
    redeemingIds.value = redeemingIds.value.filter((id) => String(id) !== String(row.id))
  }
}
/**
 * 转换页面展示格式。
 */
async function toggleMemberStatus(row) {
  const saved = await saveMember({ ...row, status: row.status === '正常' ? '冻结' : '正常' })
  Object.assign(row, normalizeMember(saved))
  ElMessage.success(`${row.nickname} 已${row.status === '正常' ? '恢复正常' : '冻结'}`)
}

/**
 * 删除当前选中记录。
 */
function deleteMember(row) {
  ElMessageBox.confirm(`确定禁用「${row.nickname}」吗？禁用后小程序端不能正常下单。`, '禁用会员', {
    confirmButtonText: '禁用',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteMemberApi(row.id)
    const saved = await saveMember({ ...row, status: '冻结' })
    Object.assign(row, normalizeMember(saved))
    ElMessage.success('会员已禁用并同步到数据库')
  }).catch(() => {})
}

/**
 * 处理当前页面业务。
 */
function moneyText(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

onMounted(loadData)
</script>

<template>
  <!-- 会员管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="member-page page-view" v-loading="loading">
    <!-- 统计卡片区：展示核心业务指标。 -->
    <div class="stat-grid">
      <div v-for="item in memberStats" :key="item.label" class="member-stat admin-card">
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
      <el-input v-model="keyword" class="filter-search" size="large" clearable suffix-icon="Search" placeholder="搜索昵称 / 手机号 / 会员ID" />
      <el-select v-model="level" size="large" clearable placeholder="全部等级" class="filter-select">
        <el-option v-for="item in levelOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="status" size="large" clearable placeholder="全部状态" class="filter-select">
        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <div class="filter-spacer"></div>
      <el-button class="search-btn" size="large" type="primary" icon="Search" @click="searchMembers">查询</el-button>
      <el-button class="reset-btn" size="large" @click="resetFilters">重置</el-button>
      <el-button class="add-btn" size="large" type="primary" icon="Plus" @click="openDialog()">新增会员</el-button>
    </section>

    <section class="member-table-card admin-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="filteredMembers" row-key="id" class="member-table" empty-text="暂无会员数据">
        <el-table-column label="会员信息" min-width="280">
          <template #default="scope">
            <div class="member-cell">
              <img class="member-avatar" :src="scope.row.avatar || defaultMember.avatar" :alt="scope.row.nickname" />
              <div class="member-copy">
                <div class="name-line">
                  <strong>{{ scope.row.nickname }}</strong>
                  <span>{{ scope.row.level }}</span>
                </div>
                <p>{{ memberNo(scope.row) }}</p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="手机号" width="142">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>

        <el-table-column label="积分" width="100">
          <template #default="scope">
            <strong class="count-text">{{ scope.row.points || 0 }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="集点" width="126">
          <template #default="scope">
            <div class="stamp-cell">
              <strong>{{ clampStamp(scope.row.stamps) }}/{{ STAMP_LIMIT }}</strong>
              <span>满10点可兑换</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="兑换集点次数" width="124">
          <template #default="scope">
            <strong class="count-text">{{ scope.row.redeemCount || 0 }}</strong>
            <span class="count-unit">次</span>
          </template>
        </el-table-column>

        <el-table-column label="优惠券" width="110">
          <template #default="scope">
            <span class="coupon-count">{{ couponCount(scope.row) }} 张</span>
          </template>
        </el-table-column>

        <el-table-column label="累计消费" width="120">
          <template #default="scope">
            <strong class="amount-text">{{ moneyText(scope.row.totalAmount) }}</strong>
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="126">
          <template #default="scope">
            <span class="plain-text">{{ scope.row.registerTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="小程序页面" min-width="190">
          <template #default="scope">
            <span class="sync-tag">{{ scope.row.miniPage }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="96">
          <template #default="scope">
            <StatusTag :status="scope.row.status" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="368" fixed="right">
          <template #default="scope">
            <!-- 表格操作区：放置详情、编辑、上下架和删除按钮。 -->
            <div class="action-buttons">
              <el-button size="small" text @click.stop="viewMember(scope.row)">查看</el-button>
              <el-button
                size="small"
                type="success"
                plain
                :disabled="clampStamp(scope.row.stamps) < STAMP_LIMIT || isRedeeming(scope.row)"
                :loading="isRedeeming(scope.row)"
                @click.stop="redeemStamp(scope.row)"
              >兑换集点</el-button>
              <el-button size="small" type="primary" plain @click.stop="openDialog(scope.row)">编辑</el-button>
              <el-button size="small" plain @click.stop="toggleMemberStatus(scope.row)">{{ scope.row.status === '正常' ? '冻结' : '解冻' }}</el-button>
              <el-button size="small" type="danger" plain @click.stop="deleteMember(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <span>共 {{ filteredMembers.length }} 条数据</span>
        <div class="pager-mock"><button>‹</button><strong>1</strong><button>›</button><em>10 条/页</em></div>
      </div>
    </section>

<!-- 弹窗表单区：新增或编辑业务数据。 -->
<el-dialog v-model="dialogVisible" title="会员信息" width="720px" class="member-dialog">
            <!-- 表单区域：收集管理员填写的数据。 -->
<!-- 表单区域：收集用户填写的数据。 -->
<el-form :model="form" label-width="92px">
        <div class="dialog-grid">
          <el-form-item label="会员昵称"><el-input v-model="form.nickname" placeholder="请输入小程序昵称" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="form.phone" placeholder="请输入手机号" /></el-form-item>
          <el-form-item label="会员ID"><el-input v-model="form.memberNo" placeholder="不填则自动生成" /></el-form-item>
          <el-form-item label="会员等级"><el-select v-model="form.level" style="width: 100%"><el-option v-for="item in levelOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="积分"><el-input-number v-model="form.points" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="集点"><el-input-number v-model="form.stamps" :min="0" :max="STAMP_LIMIT" style="width: 100%" /></el-form-item>
          <el-form-item label="兑换次数"><el-input-number v-model="form.redeemCount" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="优惠券"><el-input-number v-model="form.coupons" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="余额"><el-input-number v-model="form.balance" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="订单数"><el-input-number v-model="form.orders" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="累计消费"><el-input-number v-model="form.totalAmount" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="注册时间"><el-date-picker v-model="form.registerTime" value-format="YYYY-MM-DD" type="date" placeholder="选择注册时间" style="width: 100%" /></el-form-item>
          <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="正常" /><el-radio-button label="冻结" /></el-radio-group></el-form-item>
          <el-form-item label="头像地址" class="full-line"><el-input v-model="form.avatar" placeholder="可填写微信头像 URL 或 /admin-assets/user-avatar.png" /></el-form-item>
          <el-form-item label="同步页面" class="full-line"><el-input v-model="form.miniPage" /></el-form-item>
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
/* 会员管理页面 页面样式。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.member-page {
  gap: 22px;
}

/* 统计网格：控制顶部指标卡片排列。 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.member-stat {
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
  overflow-x: auto;
}

.filter-search {
  width: 320px;
  flex: 0 0 320px;
}

.filter-select {
  width: 160px;
  flex: 0 0 160px;
}

.filter-spacer {
  flex: 1;
  min-width: 12px;
}

.search-btn,
.reset-btn,
.add-btn {
  flex: 0 0 auto;
}

.reset-btn {
  color: #6f675c;
}

/* 表格容器：控制列表区域背景、圆角和溢出。 */
/* 会员表格：控制列表外观。 */
.member-table-card {
  padding: 0;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 14px 34px rgba(116, 93, 58, 0.06);
}

.member-table {
  border-radius: 6px;
  overflow: hidden;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  background: #f7efe3;
  border: 2px solid #eadcc8;
}

.member-copy {
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

.member-copy p,
.plain-text,
.count-unit {
  color: #736b60;
  font-size: 13px;
}

.member-copy p {
  margin: 7px 0 0;
}

.count-text,
.amount-text {
  color: #26311f;
  font-size: 16px;
}

.stamp-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stamp-cell strong {
  color: #26311f;
  font-size: 16px;
}

.stamp-cell span {
  color: #9a6f41;
  font-size: 12px;
}

/* 优惠券区域：控制券面、金额和使用状态。 */
.coupon-count {
  color: #667452;
  font-size: 14px;
  font-weight: 900;
}

.sync-tag {
  display: inline-flex;
  max-width: 180px;
  overflow: hidden;
  color: #667452;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 操作按钮组：控制表格行内按钮间距。 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
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
  height: 92px;
  color: #403c35;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #fbf4e7;
}

:deep(.member-dialog .el-dialog) {
  border-radius: 8px;
  background: #fffaf1;
}
</style>

