<!-- 后台整体布局组件：提供侧边栏、顶部栏和内容出口。 -->
<script setup>
/**
 * 后台整体布局组件 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '首页')
const todayText = computed(() => new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))
const adminName = computed(() => auth.user?.name || 'Admin')
const adminRole = computed(() => auth.user?.role || '超级管理员')
const adminAvatar = computed(() => auth.user?.avatar || '')
const adminInitial = computed(() => adminName.value.slice(0, 1) || 'A')

const menuItems = [
  { path: '/dashboard', name: '仪表盘', icon: 'House' },
  { path: '/products', name: '商品管理', icon: 'ShoppingBag' },
  { path: '/categories', name: '分类管理', icon: 'Grid' },
  { path: '/orders', name: '订单管理', icon: 'Tickets' },
  { path: '/stores', name: '门店管理', icon: 'Shop' },
  { path: '/coupons', name: '优惠券管理', icon: 'Ticket' },
  { path: '/home-content', name: '轮播图管理', icon: 'Picture' },
  { path: '/members', name: '会员管理', icon: 'User' },
  { path: '/stamp-cards', name: '集点卡管理', icon: 'Medal' },
  { path: '/settings', name: '系统设置', icon: 'Setting' }
]

/**
 * 事件处理函数。
 * 响应用户点击、输入或页面交互。
 */
function handleLogout() {
  ElMessageBox.confirm('确定退出栖岸咖啡后台吗？', '退出登录', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    auth.logout()
    router.replace('/login')
  }).catch(() => {})
}
</script>

<template>
  <!-- 后台整体布局组件 模板结构。 -->
  <!-- 后台布局容器：包含侧边栏、顶部栏和页面内容。 -->
  <div class="admin-layout">
    <!-- 左侧导航栏：切换后台管理模块。 -->
    <aside class="admin-sidebar">
      <div class="brand-area">
        <img class="brand-logo" src="/admin-assets/admin-brand-logo.jpg" alt="栖岸咖啡" />
      </div>

      <nav class="side-nav">
        <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" :class="['nav-link', { active: activeMenu === item.path }]">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="side-illustration">
        <p>栖岸一杯咖啡<br />遇见美好时光</p>
        <img src="/admin-assets/admin-login-scene.png" alt="咖啡插画" />
      </div>
    </aside>

  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="admin-main">
      <!-- 顶部工具栏：展示页面标题和管理员信息。 -->
      <header class="admin-topbar">
        <div class="title-block">
          <h1>{{ pageTitle }}</h1>
          <p>欢迎回来，<strong>{{ adminName }}</strong><span>{{ adminRole }}</span><span>今天是 {{ todayText }}</span></p>
        </div>

        <div class="top-actions">
          <div class="global-search">
            <el-icon><Search /></el-icon>
            <input placeholder="搜索商品名称、类别、关键词" />
          </div>

          <button class="notice-btn" type="button">
            <el-icon><Bell /></el-icon>
            <b>12</b>
          </button>

          <el-dropdown trigger="click">
            <span class="admin-user">
              <span class="avatar"><img v-if="adminAvatar" :src="adminAvatar" alt="管理员头像" /><span v-else>{{ adminInitial }}</span></span>
              <span class="user-copy">
                <strong>{{ adminName }}</strong>
                <em>{{ adminRole }}</em>
              </span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/settings')">系统设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content-panel">
<!-- 路由出口：根据当前地址渲染对应页面。 -->
<RouterView />
      </main>

      <footer class="admin-footer">© 2025 栖岸咖啡 QI'AN COFFEE. All rights reserved.</footer>
    </section>
  </div>
</template>

<style scoped>
/* 后台整体布局组件 页面样式。 */
/* 后台主布局：控制侧边栏和内容区结构。 */
.admin-layout {
  min-height: 100vh;
  display: flex;
  background: #fbf8f1;
  color: #2f3328;
}

/* 后台侧边栏：控制导航菜单和品牌区域。 */
.admin-sidebar {
  position: relative;
  width: 252px;
  min-height: 100vh;
  padding: 34px 18px 0;
  border-right: 1px solid rgba(202, 188, 166, 0.48);
  background: rgba(255, 251, 244, 0.95);
  overflow: hidden;
  box-shadow: 10px 0 30px rgba(118, 96, 64, 0.04);
}

.brand-area {
  height: 86px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.brand-logo {
  width: 182px;
  height: 64px;
  object-fit: cover;
  object-position: center;
  mix-blend-mode: multiply;
}

.side-nav {
  position: relative;
  z-index: 4;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  height: 52px;
  padding: 0 24px;
  border-radius: 8px;
  color: #4c4436;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.nav-link .el-icon {
  color: #7d6546;
  font-size: 20px;
}

.nav-link.active {
  background: #5e774d;
  color: #fff8ea;
  box-shadow: 0 12px 24px rgba(89, 111, 72, 0.18);
}

.nav-link.active .el-icon {
  color: #fff8ea;
}

.side-illustration {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -18px;
  z-index: 1;
  height: 310px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.side-illustration p {
  position: absolute;
  left: 74px;
  top: 60px;
  z-index: 2;
  margin: 0;
  color: #55704b;
  font-size: 18px;
  line-height: 1.8;
  letter-spacing: 3px;
  font-family: serif;
}

.side-illustration img {
  position: absolute;
  left: -64px;
  bottom: 8px;
  width: 400px;
  opacity: 0.82;
  mix-blend-mode: multiply;
}

.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 后台顶部栏：控制标题、日期和用户信息。 */
.admin-topbar {
  height: 116px;
  padding: 0 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 251, 244, 0.72);
}

.title-block h1 {
  margin: 0;
  color: #22231f;
  font-size: 26px;
  line-height: 34px;
  font-weight: 900;
}

.title-block p {
  margin: 12px 0 0;
  color: #8b8379;
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 14px;
}

.title-block strong {
  color: #2c2d28;
  font-size: 16px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.global-search {
  width: 360px;
  height: 50px;
  padding: 0 18px;
  border: 1px solid rgba(202, 188, 166, 0.62);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  gap: 12px;
}

.global-search .el-icon {
  color: #33342f;
  font-size: 22px;
}

.global-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #33342f;
  font-size: 15px;
}

.notice-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  color: #33342f;
  cursor: pointer;
}

.notice-btn .el-icon {
  font-size: 26px;
}

.notice-btn b {
  position: absolute;
  right: 2px;
  top: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: #c96f2b;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #22231f;
  cursor: pointer;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #d9cbb6;
  color: #5e774d;
  display: grid;
  place-items: center;
  overflow: hidden;
  font-weight: 900;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-copy strong,
.user-copy em {
  display: block;
  font-style: normal;
}

.user-copy strong {
  font-size: 16px;
}

.user-copy em {
  margin-top: 3px;
  color: #8b8379;
  font-size: 12px;
}

.content-panel {
  flex: 1;
  min-width: 0;
  padding: 0 42px 24px;
  overflow: auto;
}

.admin-footer {
  padding: 18px 42px 26px;
  color: #9c9489;
  font-size: 13px;
  text-align: center;
}
</style>
