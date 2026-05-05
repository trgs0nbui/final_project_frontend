import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'
import router from '@/router/index.js'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const user = ref(null) // { id, username, email }
    const accessToken = ref(null)
    const refreshToken = ref(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const error = ref(null)

    /**
     * Login with username and password.
     * POST /api/auth/token/ — saves accessToken, refreshToken, user to state.
     * @param {{ username: string, password: string }} credentials
     */
    async function login(credentials) {
      isLoading.value = true
      error.value = null

      try {
        const response = await apiClient.post('/api/auth/token/', {
          username: credentials.username,
          password: credentials.password,
        })

        const { access, refresh, user: userData } = response.data

        accessToken.value = access
        refreshToken.value = refresh
        isAuthenticated.value = true

        // Some backends return user info in the token response; others require a separate call.
        // If user data is included, store it directly; otherwise build a minimal object.
        if (userData) {
          user.value = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
          }
        } else {
          // Decode username from credentials as a fallback until profile is fetched
          user.value = { id: null, username: credentials.username, email: null }
        }
      } catch (err) {
        error.value = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        isAuthenticated.value = false
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Register a new account, then auto-login.
     * POST /api/auth/register/ — then calls login() internally.
     * @param {{ username: string, email: string, password: string }} userData
     */
    async function register(userData) {
      isLoading.value = true
      error.value = null

      try {
        await apiClient.post('/api/auth/register/', {
          username: userData.username,
          email: userData.email,
          password: userData.password,
        })

        // Auto-login after successful registration
        await login({ username: userData.username, password: userData.password })
      } catch (err) {
        error.value = err.message || 'Đăng ký thất bại. Vui lòng thử lại.'
        isLoading.value = false
      }
    }

    /**
     * Logout — clears all tokens and user from state, redirects to /login.
     */
    function logout() {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      isAuthenticated.value = false
      error.value = null

      router.push('/login')
    }

    /**
     * Refresh the access token using the stored refresh token.
     * POST /api/auth/token/refresh/
     */
    async function refreshAccessToken() {
      isLoading.value = true
      error.value = null

      try {
        const response = await apiClient.post('/api/auth/token/refresh/', {
          refresh: refreshToken.value,
        })

        accessToken.value = response.data.access
      } catch (err) {
        error.value = err.message || 'Không thể làm mới phiên đăng nhập.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      error,
      // Actions
      login,
      register,
      logout,
      refreshAccessToken,
    }
  },
  {
    persist: {
      storage: localStorage,
      paths: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
    },
  },
)
