<!-- 页面工具栏组件：统一页面标题和操作按钮区域。 -->
<script setup>
/**
 * 页面工具栏组件 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <!-- 页面工具栏组件 模板结构。 -->
  <div class="toolbar admin-card">
    <div>
      <h3>{{ title }}</h3>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <!-- 操作按钮区：放置新增查询等。 -->
    <div class="toolbar-actions">
      <slot name="actions" />
    </div>
    <div class="toolbar-extra">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 页面工具栏组件 页面样式。 */
.toolbar {
  padding: 16px 18px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px 18px;
  align-items: center;
}

h3 {
  margin: 0;
  color: #303622;
  font-size: 18px;
}

p {
  margin: 6px 0 0;
  color: #776d5a;
  font-size: 13px;
}

/* 操作区：排列工具按钮。 */
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-extra {
  grid-column: 1 / -1;
}
</style>