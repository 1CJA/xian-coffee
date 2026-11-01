/**
 * 管理员登录状态仓库。
 * 保存登录 token、管理员信息和退出逻辑。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi } from '../api/adminApi'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('xianAdminToken') || '')
  const user = ref(JSON.parse(localStorage.getItem('xianAdminUser') || 'null'))
  const isLoggedIn = computed(() => Boolean(token.value))

  /**
   * 处理当前业务数据。
   */
  async function login(form) {
    const data = await loginApi(form)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('xianAdminToken', data.token)
    localStorage.setItem('xianAdminUser', JSON.stringify(data.user))
  }

  /**
   * 更新当前页面数据。
   */
  function updateUser(payload) {
    user.value = { ...(user.value || {}), ...payload }
    localStorage.setItem('xianAdminUser', JSON.stringify(user.value))
  }

  /**
   * 处理当前业务数据。
   */
  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('xianAdminToken')
    localStorage.removeItem('xianAdminUser')
  }

  return { token, user, isLoggedIn, login, updateUser, logout }
})