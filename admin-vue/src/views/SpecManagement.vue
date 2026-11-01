<!-- 规格管理页面：维护温度、杯型、糖度和加料。 -->
<script setup>
/**
 * 规格管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSpecs, saveSpecGroup } from '../api/adminApi'
import PageToolbar from '../components/PageToolbar.vue'

const specGroups = ref([])
const newOption = ref('')
const activeGroup = ref('temperature')
const activeSpec = computed(() => specGroups.value.find((item) => item.id === activeGroup.value))

/**
 * 加载页面数据。
 * 从后端接口或本地数据源获取页面所需内容。
 */
async function loadData() {
  specGroups.value = await getSpecs()
}

/**
 * 处理当前页面业务。
 */
async function persistGroup(group, message) {
  const saved = await saveSpecGroup({ ...group, options: [...group.options] })
  Object.assign(group, saved)
  ElMessage.success(message)
}

/**
 * 处理当前页面业务。
 */
async function addOption(group) {
  const value = newOption.value.trim()
  if (!value) return
  if (group.options.includes(value)) {
    ElMessage.warning('该规格选项已存在')
    return
  }
  group.options.push(value)
  newOption.value = ''
  await persistGroup(group, '规格选项已同步到商品管理和商品详情页')
}

/**
 * 删除当前选中记录。
 */
async function removeOption(group, option) {
  group.options = group.options.filter((item) => item !== option)
  await persistGroup(group, '规格选项已删除并同步')
}

onMounted(loadData)
</script>

<template>
  <!-- 规格管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="page-view">
    <div class="page-title-row">
      <div>
        <h2>商品规格管理</h2>
        <p>对应小程序商品详情页里的温度、杯型、糖度、加料选择。</p>
      </div>
    </div>

    <PageToolbar title="商品详情页规格" subtitle="用户在商品详情页选择规格后，会带到购物袋和确认订单页">
      <template #actions>
        <span class="sync-tag">商品详情页 / 购物袋页 / 确认订单页</span>
      </template>
    </PageToolbar>

    <div class="spec-layout">
      <div class="spec-sidebar admin-card">
        <button v-for="group in specGroups" :key="group.id" :class="['spec-nav', { active: activeGroup === group.id }]" @click="activeGroup = group.id">
          <strong>{{ group.name }}</strong>
          <span>{{ group.required ? '必选规格' : '可选规格' }}</span>
        </button>
      </div>

      <div v-if="activeSpec" class="spec-phone admin-card">
        <div class="phone-head">
          <span class="mini-page-pill">商品详情页</span>
          <el-tag :type="activeSpec.required ? 'success' : 'info'">{{ activeSpec.required ? '必选' : '可选' }}</el-tag>
        </div>
        <h3>{{ activeSpec.name }}</h3>
        <p>这些选项会在小程序商品详情页以按钮形式展示。</p>
        <div class="option-list">
          <el-tag v-for="option in activeSpec.options" :key="option" closable size="large" @close="removeOption(activeSpec, option)">{{ option }}</el-tag>
        </div>
        <el-input v-model="newOption" placeholder="新增规格选项，如：少冰" style="width: 300px" @keyup.enter="addOption(activeSpec)">
          <template #append><el-button @click="addOption(activeSpec)">添加</el-button></template>
        </el-input>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 规格管理页面 页面样式。 */
.spec-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 18px;
}

.spec-sidebar {
  padding: 12px;
}

.spec-nav {
  width: 100%;
  border: 0;
  border-radius: 8px;
  padding: 16px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.spec-nav + .spec-nav {
  margin-top: 8px;
}

.spec-nav.active {
  background: #667452;
  color: #fff8ea;
}

.spec-nav strong,
.spec-nav span {
  display: block;
}

.spec-nav strong {
  font-size: 18px;
}

.spec-nav span {
  margin-top: 5px;
  color: #8b806a;
  font-size: 12px;
}

.spec-nav.active span {
  color: rgba(255, 248, 234, 0.76);
}

.spec-phone {
  padding: 24px;
  min-height: 330px;
}

.phone-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.spec-phone h3 {
  margin: 22px 0 8px;
  color: #26311f;
  font-size: 28px;
}

.spec-phone p {
  margin: 0;
  color: #746955;
}

.option-list {
  margin: 28px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
