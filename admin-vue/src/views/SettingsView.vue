<!-- 管理员设置页面：维护管理员资料和头像。 -->
<script setup>
/**
 * 管理员设置页面 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const form = reactive({
  name: auth.user?.name || '栖岸管理员',
  role: auth.user?.role || '系统管理员',
  phone: auth.user?.phone || '13800000000',
  password: '',
  notice: true,
  avatar: auth.user?.avatar || ''
})

/**
 * 事件处理函数。
 * 响应用户点击、输入或页面交互。
 */
function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    event.target.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('头像图片不能超过 2MB')
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.avatar = String(reader.result || '')
    ElMessage.success('头像已选择，请保存设置')
  }
  reader.readAsDataURL(file)
}

/**
 * 删除当前选中记录。
 */
function removeAvatar() {
  form.avatar = ''
}

/**
 * 提交表单数据。
 * 处理当前页面主要提交动作。
 */
function submitSettings() {
  auth.updateUser({
    name: form.name,
    role: form.role,
    phone: form.phone,
    avatar: form.avatar
  })
  ElMessage.success('管理员设置已保存')
}
</script>

<template>
  <!-- 管理员设置页面 模板结构。 -->
  <!-- 页面主区域：承载当前后台页面内容。 -->
  <section class="page-view">
    <div class="page-title-row">
      <div>
        <h2>管理员设置</h2>
        <p>维护后台管理员资料和消息提醒设置。</p>
      </div>
    </div>

    <div class="admin-card settings-card">
            <!-- 表单区域：收集管理员填写的数据。 -->
  <!-- 表单区域：收集用户填写的数据。 -->
  <el-form :model="form" label-width="100px" @submit.prevent="submitSettings">
        <el-form-item label="管理员头像">
          <div class="avatar-upload-row">
            <label class="avatar-preview" for="adminAvatarInput">
              <img v-if="form.avatar" :src="form.avatar" alt="管理员头像" />
              <span v-else>{{ form.name.slice(0, 1) || 'A' }}</span>
            </label>
            <div class="avatar-actions">
              <input id="adminAvatarInput" class="avatar-input" type="file" accept="image/*" @change="handleAvatarChange" />
              <label class="upload-btn" for="adminAvatarInput">上传头像</label>
              <el-button v-if="form.avatar" text type="danger" @click="removeAvatar">移除</el-button>
              <p>支持 jpg、png，建议使用正方形图片。</p>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="管理员名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色"><el-input v-model="form.role" disabled /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="新密码"><el-input v-model="form.password" type="password" show-password placeholder="不修改可留空" /></el-form-item>
        <el-form-item label="消息提醒"><el-switch v-model="form.notice" active-text="开启" inactive-text="关闭" /></el-form-item>
        <el-form-item><el-button type="primary" native-type="submit">保存设置</el-button></el-form-item>
      </el-form>
    </div>
  </section>
</template>

<style scoped>
/* 管理员设置页面 页面样式。 */
.settings-card {
  max-width: 680px;
  padding: 28px;
}

.avatar-upload-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar-preview {
  width: 82px;
  height: 82px;
  border: 2px solid #e0d2bd;
  border-radius: 50%;
  background: #d9cbb6;
  color: #5e774d;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
  font-size: 28px;
  font-weight: 900;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.avatar-actions p {
  width: 100%;
  margin: 0;
  color: #8b8379;
  font-size: 13px;
}

.avatar-input {
  display: none;
}

.upload-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  background: #667452;
  color: #fffaf1;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}
</style>
