/**
 * 后台路由配置。
 * 定义登录页、管理页和访问守卫。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/', redirect: '/login' },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: '小程序数据概览' } },
      { path: '/products', name: 'products', component: () => import('../views/ProductManagement.vue'), meta: { title: '商品管理' } },
      { path: '/products/:id', name: 'productDetail', component: () => import('../views/ProductDetailView.vue'), meta: { title: '商品详情预览' } },
      { path: '/categories', name: 'categories', component: () => import('../views/CategoryManagement.vue'), meta: { title: '分类管理' } },
      { path: '/specs', name: 'specs', component: () => import('../views/SpecManagement.vue'), meta: { title: '商品规格管理' } },
      { path: '/orders', name: 'orders', component: () => import('../views/OrderManagement.vue'), meta: { title: '订单管理' } },
      { path: '/orders/:id', name: 'orderDetail', component: () => import('../views/OrderDetailView.vue'), meta: { title: '订单详情预览' } },
      { path: '/coupons', name: 'coupons', component: () => import('../views/CouponManagement.vue'), meta: { title: '优惠券管理' } },
      { path: '/members', name: 'members', component: () => import('../views/MemberManagement.vue'), meta: { title: '会员管理' } },
      { path: '/stamp-cards', name: 'stampCards', component: () => import('../views/StampCardManagement.vue'), meta: { title: '集点卡管理' } },
      { path: '/stores', name: 'stores', component: () => import('../views/StoreManagement.vue'), meta: { title: '门店管理' } },
      { path: '/home-content', name: 'homeContent', component: () => import('../views/CarouselManagement.vue'), meta: { title: '轮播图管理' } },
      { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: '管理员设置' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  return true
})

export default router


