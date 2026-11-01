<!-- 后台登录页面：处理管理员账号登录。 -->
<script setup>
/**
 * 后台登录页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
// 加载状态：用于控制页面或表格的 loading 效果。
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: 'CHANGE_ME_BEFORE_RUN',
  remember: true
})

const rules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/**
 * 提交表单数据。
 * 校验通过后保存到后端或本地状态。
 */
async function submitLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    await auth.login(loginForm)
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/dashboard')
  } finally {
    loading.value = false
  }
}

/**
 * 事件处理函数。
 * 响应用户点击、输入或页面交互。
 */
function handleForgotPassword() {
  ElMessage.info('请联系系统管理员重置密码')
}

/**
 * 处理按钮和表格事件。
 */
function handleOtherLogin() {
  ElMessage.info('其他登录方式后续接入')
}
</script>

<template>
  <!-- 后台登录页面 模板结构。 -->
  <main class="login-page">
    <!-- 品牌展示区：放置 logo 和插图。 -->
    <section class="brand-area">
      <img class="brand-logo" src="/admin-assets/admin-brand-logo.jpg" alt="栖岸咖啡" />

      <div class="welcome-copy">
        <span>欢迎使用</span>
        <h1>栖岸咖啡后台管理系统</h1>
        <p>一杯好咖啡，源自用心的管理</p>

      </div>

      <img class="scene-image" src="/admin-assets/admin-login-scene.png" alt="栖岸咖啡插画" />
    </section>

    <!-- 登录表单区：管理员账号登录。 -->
    <section class="login-card">
      <div class="card-title">
        <h2>后台管理登录</h2>
        <p>请输入您的账号和密码登录系统</p>
      </div>
      <!-- 表单区域：收集管理员账号密码。 -->
      <el-form ref="formRef" :model="loginForm" :rules="rules" label-position="top" @submit.prevent="submitLogin">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" size="large" placeholder="请输入账号/手机号/邮箱" prefix-icon="User" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" size="large" type="password" show-password placeholder="请输入密码" prefix-icon="Lock" />
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <button type="button" @click="handleForgotPassword">忘记密码?</button>
        </div>

        <el-button type="primary" :loading="loading" native-type="submit" class="login-btn">登录</el-button>
      </el-form>

      <!-- 备用登录区：预留其他方式。 -->
      <div class="other-login">
        <div class="divider"><span>其他登录方式</span></div>
        <button type="button" class="shield-btn" @click="handleOtherLogin">
          <el-icon><Lock /></el-icon>
        </button>
      </div>
    </section>

    <footer class="login-footer">© 2025 栖岸咖啡　QI'AN COFFEE. All rights reserved.　｜　隐私政策　｜　使用条款</footer>
  </main>
</template>

<style scoped>
/* 后台登录页面 页面样式。 */
/* 登录页布局：控制背景、插图和登录卡片。 */
/* 页面主容器：控制整体间距、背景和安全区域。 */
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #fbf7ef;
  display: grid;
  grid-template-columns: minmax(560px, 1fr) 560px;
  align-items: center;
}

/* 品牌展示区：控制左侧视觉。 */
.brand-area {
  position: relative;
  min-height: 100vh;
  padding: 118px 0 118px 158px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
}

.brand-logo {
  margin-top: -90px;
  width: 330px;
  height: 126px;
  object-fit: cover;
  object-position: center;
  mix-blend-mode: multiply;
}

.welcome-copy {
  position: relative;
  z-index: 2;
  margin-top: -20px;
  color: #4c2e19;
}

.welcome-copy span {
  margin: 20px 120px 24px;
  display: block;
  font-size: 32px;
  line-height: 42px;
  letter-spacing: 3px;
}

.welcome-copy h1 {
  margin: 20px 120px 24px;
  font-size: 50px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: 6px;
}

.welcome-copy p {
  margin: 20px 120px 24px;
  color: #6f604f;
  font-size: 18px;
  letter-spacing: 1px;
}



.scene-image {
  position: absolute;
  left: 90px;
  bottom: -10px;
  width: 1000px;
  max-width: 64%;
  opacity: 0.82;
  mix-blend-mode: multiply;
  pointer-events: none;
}

/* 登录卡片区：控制表单外观。 */
.login-card {
  width: 520px;
  min-height: 650px;
  padding: 70px 58px 54px;
  border: 1px solid rgba(198, 185, 165, 0.46);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 52px rgba(80, 64, 42, 0.08);
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.card-title {
  margin-bottom: 44px;
  text-align: center;
}

.card-title h2 {
  margin: 0;
  color: #2f2f2b;
  font-size: 32px;
  line-height: 42px;
  font-weight: 700;
}

.card-title p {
  margin: 16px 0 0;
  color: #9a938a;
  font-size: 15px;
}

:deep(.el-form-item) {
  margin-bottom: 26px;
}

:deep(.el-form-item__label) {
  color: #3e3c36;
  font-size: 15px;
  font-weight: 700;
}

:deep(.el-input__wrapper) {
  height: 54px;
  padding: 0 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 0 0 1px #ded8ce inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #5d7448 inset;
}

.login-options {
  margin: 6px 0 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-options button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #7c6f62;
  font-size: 14px;
  cursor: pointer;
}

.login-options button:hover {
  color: #557044;
}

.login-btn {
  width: 100%;
  height: 58px;
  border-radius: 7px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 10px;
}

.other-login {
  margin-top: 36px;
}

.divider {
  height: 1px;
  background: #ded8ce;
  display: flex;
  justify-content: center;
  align-items: center;
}

.divider span {
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.88);
  color: #9a938a;
  font-size: 14px;
}

.shield-btn {
  width: 58px;
  height: 58px;
  margin: 34px auto 0;
  border: 0;
  border-radius: 50%;
  background: #faf3ea;
  color: #8a6a43;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(103, 83, 54, 0.08);
}

.login-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  color: #9b9288;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 1180px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 40px 24px 80px;
  }

  .brand-area {
    min-height: auto;
    padding: 30px 0 20px;
    align-items: center;
    text-align: center;
  }

  .welcome-copy {
    margin-top: 34px;
  }

  .scene-image {
    display: none;
  }

  .login-card {
    width: min(520px, 100%);
    min-height: auto;
    margin: 20px auto 0;
  }
}
</style>
