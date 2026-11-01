<!-- 首页内容管理页面：维护首页展示内容。 -->
<script setup>
/**
 * 首页内容管理页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeContent, saveHomeContent } from '../api/adminApi'
import PageToolbar from '../components/PageToolbar.vue'
import StatusTag from '../components/StatusTag.vue'

const contents = ref([])
const dialogVisible = ref(false)
const form = reactive({ id: '', title: '', position: '', status: '展示中', desc: '', image: '/admin-assets/hero-store.png' })

/**
 * 加载页面数据。
 * 从后端接口或本地数据源获取页面所需内容。
 */
async function loadData() {
  contents.value = await getHomeContent()
}

/**
 * 打开弹窗并填充表单。
 */
function openDialog(row) {
  Object.assign(form, row || { id: '', title: '', position: '', status: '展示中', desc: '', image: '/admin-assets/hero-store.png' })
  dialogVisible.value = true
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitForm() {
  const saved = await saveHomeContent({ ...form })
  const index = contents.value.findIndex((item) => item.id === saved.id)
  if (index >= 0) contents.value.splice(index, 1, saved)
  else contents.value.unshift(saved)
  dialogVisible.value = false
  ElMessage.success('首页内容已同步到小程序')
}

onMounted(loadData)
</script>

<template>
  <!-- 首页内容管理页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="page-view">
    <div class="page-title-row">
      <div>
        <h2>首页入口管理</h2>
        <p>对应小程序首页欢迎页、功能入口页、菜单点单页顶部推荐内容。</p>
      </div>
      <el-button type="primary" icon="Plus" @click="openDialog()">新增首页内容</el-button>
    </div>

    <PageToolbar title="小程序首页内容" subtitle="这些内容后续会从 Spring Boot 接口返回给首页和功能入口页" />

    <div class="home-content-grid">
      <div v-for="item in contents" :key="item.id" class="home-card admin-card">
        <img :src="item.image" :alt="item.title" />
        <div class="home-info">
          <div class="home-top">
            <span class="mini-page-pill">{{ item.position }}</span>
            <StatusTag :status="item.status" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <el-button type="primary" plain @click="openDialog(item)">编辑内容</el-button>
        </div>
      </div>
    </div>

    <div class="admin-card table-card">
  <!-- 数据表格区：展示后台管理列表数据。 -->
  <el-table :data="contents" stripe>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="position" label="展示位置" />
        <el-table-column prop="desc" label="说明" />
        <el-table-column label="状态" width="110"><template #default="scope"><StatusTag :status="scope.row.status" /></template></el-table-column>
        <el-table-column label="操作" width="110"><template #default="scope"><el-button size="small" type="primary" @click="openDialog(scope.row)">编辑</el-button></template></el-table-column>
      </el-table>
    </div>

  <!-- 弹窗表单区：新增或编辑业务数据。 -->
  <el-dialog v-model="dialogVisible" title="首页内容" width="560px">
            <!-- 表单区域：收集管理员填写的数据。 -->
  <!-- 表单区域：收集用户填写的数据。 -->
  <el-form :model="form" label-width="90px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="位置"><el-input v-model="form.position" /></el-form-item>
        <el-form-item label="图片路径"><el-input v-model="form.image" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button label="展示中" /><el-radio-button label="已隐藏" /></el-radio-group></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.desc" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitForm">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
/* 首页内容管理页面 页面样式。 */
.home-content-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.home-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.home-card img {
  width: 100%;
  height: 190px;
  object-fit: contain;
  background: #f4ead9;
}

.home-info {
  padding: 18px;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.home-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.home-info h3 {
  margin: 18px 0 8px;
  color: #26311f;
  font-size: 22px;
}

.home-info p {
  min-height: 52px;
  margin: 0 0 18px;
  color: #746955;
  line-height: 1.7;
}
</style>
