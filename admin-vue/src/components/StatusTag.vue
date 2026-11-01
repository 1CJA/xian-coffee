<!-- 状态标签组件：统一订单、商品和会员状态展示。 -->
<script setup>
/**
 * 状态标签组件 脚本。
 * 处理页面数据、接口请求和用户交互。
 */
defineProps({
  status: { type: String, required: true }
})

const typeMap = {
  上架: 'success',
  下架: 'info',
  启用: 'success',
  停用: 'info',
  可使用: 'success',
  已过期: 'info',
  待付款: 'warning',
  待接单: 'warning',
  制作中: 'primary',
  已完成: 'success',
  已取消: 'info',
  正常: 'success',
  冻结: 'danger',
  营业中: 'success',
  休息中: 'info'
}
</script>

<template>
  <!-- 状态标签组件 模板结构。 -->
  <el-tag :type="typeMap[status] || 'info'" effect="plain">{{ status }}</el-tag>
</template>
