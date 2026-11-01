<!-- 商品详情预览页面：预览小程序商品详情效果。 -->
<script setup>
/**
 * 商品详情预览页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct } from '../api/adminApi'
import StatusTag from '../components/StatusTag.vue'

const route = useRoute()
const router = useRouter()
// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)
const product = ref(null)

/**
 * 加载表格和统计数据。
 */
async function loadProduct() {
  loading.value = true
  try {
    product.value = await getProduct(route.params.id)
  } finally {
    loading.value = false
  }
}

onMounted(loadProduct)
</script>

<template>
  <!-- 商品详情预览页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="page-view" v-loading="loading">
    <div class="page-title-row">
      <div>
        <h2>商品详情预览</h2>
        <p>查看当前商品会同步到小程序菜单点单页、搜索页面和商品详情页的内容。</p>
      </div>
      <el-button @click="router.back()">返回商品管理</el-button>
    </div>

    <el-empty v-if="!product" description="商品不存在" />
    <template v-else>
      <div class="detail-layout">
        <div class="product-phone admin-card">
          <span class="mini-page-pill">商品详情页</span>
          <img :src="product.detailImageUrl || product.image" :alt="product.name" />
          <div class="phone-title">
            <h3>{{ product.name }}</h3>
            <strong>¥{{ product.price }}</strong>
          </div>
          <p>{{ product.desc }}</p>
          <div class="spec-preview">
            <span v-for="item in product.specs.split('、')" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="detail-info admin-card">
          <h3>后台维护信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品名称">{{ product.name }}</el-descriptions-item>
            <el-descriptions-item label="状态"><StatusTag :status="product.status" /></el-descriptions-item>
            <el-descriptions-item label="分类">{{ product.categoryName }}</el-descriptions-item>
            <el-descriptions-item label="价格">¥{{ product.price }}</el-descriptions-item>
            <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
            <el-descriptions-item label="销量">{{ product.sales }}</el-descriptions-item>
            <el-descriptions-item label="标签">{{ product.tag }}</el-descriptions-item>
            <el-descriptions-item label="小程序页面">{{ product.miniPage }}</el-descriptions-item>
            <el-descriptions-item label="商品描述" :span="2">{{ product.desc }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* 商品详情预览页面 页面样式。 */
.detail-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
}

/* 商品区域：控制商品图片、信息、价格和按钮。 */
.product-phone {
  padding: 22px;
  background: #f4ead9;
}

.product-phone img {
  width: 100%;
  height: 260px;
  object-fit: contain;
}

.phone-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.phone-title h3 {
  margin: 0;
  color: #26311f;
  font-size: 28px;
}

.phone-title strong {
  color: #667452;
  font-size: 26px;
}

.product-phone p {
  margin: 12px 0 18px;
  color: #746955;
  line-height: 1.7;
}

.spec-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-preview span {
  padding: 9px 14px;
  border-radius: 999px;
  background: #fff8ea;
  color: #526044;
  font-weight: 800;
}

.detail-info {
  padding: 24px;
}

.detail-info h3 {
  margin: 0 0 18px;
  color: #26311f;
}
</style>
