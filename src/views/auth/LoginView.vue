<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="PM App Logo" class="login-logo" />
        <h1 class="login-title">Đăng nhập</h1>
        <p class="login-subtitle">Chào mừng bạn trở lại</p>
      </div>

      <!-- Form -->
      <el-form
        ref="formRef"
        :model="formData"
        label-position="top"
        size="large"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <!-- Username -->
        <el-form-item label="Tên đăng nhập" class="form-item">
          <el-input
            v-model="formData.username"
            placeholder="Nhập tên đăng nhập"
            :prefix-icon="User"
            autocomplete="username"
            :disabled="authStore.isLoading"
            @blur="validateField('username')"
          />
          <p v-if="errors.username" class="field-error" role="alert">
            {{ errors.username }}
          </p>
        </el-form-item>

        <!-- Password -->
        <el-form-item label="Mật khẩu" class="form-item">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="Nhập mật khẩu"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            :disabled="authStore.isLoading"
            @blur="validateField('password')"
          />
          <p v-if="errors.password" class="field-error" role="alert">
            {{ errors.password }}
          </p>
        </el-form-item>

        <!-- API-level error (e.g. wrong credentials) -->
        <el-alert
          v-if="authStore.error"
          :title="authStore.error"
          type="error"
          show-icon
          :closable="false"
          class="api-error"
        />

        <!-- Submit -->
        <el-button
          type="primary"
          native-type="submit"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading"
          class="submit-btn"
          @click="handleSubmit"
        >
          {{ authStore.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </el-button>
      </el-form>

      <!-- Footer link -->
      <p class="login-footer">
        Chưa có tài khoản?
        <router-link to="/register" class="footer-link">Đăng ký ngay</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ── Validation schema ────────────────────────────────────────────────────────
const loginSchema = yup.object({
  username: yup.string().required('Tên đăng nhập không được để trống'),
  password: yup.string().required('Mật khẩu không được để trống'),
})

// ── VeeValidate setup ────────────────────────────────────────────────────────
const { handleSubmit: veeHandleSubmit, errors, validateField, defineField } = useForm({
  validationSchema: loginSchema,
})

// defineField returns [modelValue, attrs]; we bind the value into a reactive object
const [usernameField] = defineField('username')
const [passwordField] = defineField('password')

// Keep a single reactive object for el-input v-model binding
const formData = reactive({
  get username() { return usernameField.value ?? '' },
  set username(v) { usernameField.value = v },
  get password() { return passwordField.value ?? '' },
  set password(v) { passwordField.value = v },
})

// ── Submit handler ───────────────────────────────────────────────────────────
const handleSubmit = veeHandleSubmit(async (values) => {
  await authStore.login(values)

  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
/* ── Page layout ─────────────────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  height: 48px;
  width: auto;
  margin-bottom: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-item {
  margin-bottom: 8px;
}

/* Inline field error */
.field-error {
  margin: 4px 0 0;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
}

/* API-level error alert */
.api-error {
  margin-bottom: 12px;
}

/* Submit button */
.submit-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

.footer-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.footer-link:hover {
  text-decoration: underline;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>
