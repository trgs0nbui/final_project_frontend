import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Route definitions for the Project Management App.
 *
 * meta fields:
 *   requiresAuth {boolean} — navigation guard will redirect unauthenticated users to /login
 *   title        {string}  — used by afterEach to update document.title
 */
const routes = [
  // ── Auth routes (no auth required) ──────────────────────────────────────
  {
    path: '/login',
    name: 'login',
    // Login is loaded eagerly so the first paint is fast
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: 'Đăng nhập' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: 'Đăng ký' },
  },

  // ── Protected routes ─────────────────────────────────────────────────────
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  // {
  //   path: '/projects/:id',
  //   name: 'project-detail',
  //   component: () => import('@/views/ProjectDetailView.vue'),
  //   meta: { requiresAuth: true, title: 'Chi tiết dự án' },
  //   children: [
  //     {
  //       path: 'tasks/:taskId',
  //       name: 'task-detail',
  //       // Rendered inside ProjectDetailView's <router-view>
  //       component: () => import('@/views/ProjectDetailView.vue'),
  //       meta: { requiresAuth: true, title: 'Chi tiết công việc' },
  //     },
  //   ],
  // },

  // ── Error / fallback routes ───────────────────────────────────────────────
  // {
  //   path: '/404',
  //   name: 'not-found',
  //   // Inline placeholder until NotFoundView.vue is built in task 13
  //   component: { template: '<div style="padding:40px;text-align:center"><h1>404</h1><p>Không tìm thấy trang</p><a href="/login">Quay về trang chủ</a></div>' },
  //   meta: { title: 'Không tìm thấy trang' },
  // },
  // {
  //   // Catch-all: redirect any unknown path to the named not-found route
  //   path: '/:pathMatch(.*)*',
  //   redirect: { name: 'not-found' },
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ── Navigation Guards ────────────────────────────────────────────────────────

/**
 * beforeEach — authentication guard.
 *
 * Rules:
 *  1. Route requires auth + user NOT authenticated  → redirect to /login
 *  2. Route is /login or /register + user IS authenticated → redirect to /dashboard
 *  3. All other cases → allow navigation
 *
 * NOTE: useAuthStore() is called inside the guard (not at module level) so
 * that Pinia is guaranteed to be initialized before the store is accessed.
 * The top-level import is fine here — it only registers the store definition,
 * not the Pinia instance, so there is no circular-initialization problem.
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  const isAuthenticated = authStore.isAuthenticated

  // 1. Protected route — user not logged in
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // 2. Auth-only pages (login / register) — user already logged in
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    return { name: 'dashboard' }
  }

  // 3. Allow navigation
  return true
})

/**
 * afterEach — document title updater.
 *
 * Sets document.title to the route's meta.title value, falling back to a
 * default app name when the route does not define one.
 */
router.afterEach((to) => {
  document.title = to.meta.title ?? 'Project Manager'
})

export default router
