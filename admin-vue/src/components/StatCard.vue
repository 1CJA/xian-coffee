<!-- 统计卡片组件：展示后台首页和列表页统计指标。 -->
<script setup>
/**
 * 统计卡片组件 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  unit: { type: String, default: '' },
  trend: { type: String, default: '' },
  icon: { type: String, default: 'DataLine' }
})
</script>

<template>
  <!-- 统计卡片组件 模板结构。 -->
  <div class="stat-card admin-card">
    <!-- 指标图标区：突出统计类型。 -->
    <div class="stat-icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div>
      <p>{{ label }}</p>
      <strong>{{ value }}<span>{{ unit }}</span></strong>
      <em>{{ trend }}</em>
    </div>
  </div>
</template>

<style scoped>
/* 统计卡片组件 页面样式。 */
.stat-card {
  min-height: 116px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 图标区：控制统计图标。 */
.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: #74805d;
  color: #fff8ea;
  display: grid;
  place-items: center;
  font-size: 24px;
}

p {
  margin: 0;
  color: #7d725f;
  font-size: 14px;
}

strong {
  display: block;
  margin-top: 8px;
  color: #303622;
  font-size: 30px;
  line-height: 36px;
}

span {
  margin-left: 4px;
  font-size: 14px;
}

em {
  display: block;
  margin-top: 6px;
  color: #74805d;
  font-size: 13px;
  font-style: normal;
}
</style>