<template>
  <div class="register-page">
    <div class="register-card">
      <!-- Header -->
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="PM App Logo" class="register-logo" />
        <h1 class="register-title">Tạo tài khoản</h1>
        <p class="register-subtitle">Bắt đầu quản lý dự án của bạn</p>
      </div>

      <!-- Form -->
      <el-form
        label-position="top"
        size="large"
        class="register-form"
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

        <!-- Email -->
        <el-form-item label="Email" class="form-item">
          <el-input
            v-model="formData.email"
            type="email"
            placeholder="Nhập địa chỉ email"
            :prefix-icon="Message"
            autocomplete="email"
            :disabled="authStore.isLoading"
            @blur="validateField('email')"
          />
          <p v-if="errors.email" class="field-error" role="alert">
            {{ errors.email }}
          </p>
        </el-form-item>

        <!-- Password -->
        <el-form-item label="Mật khẩu" class="form-item">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            :disabled="authStore.isLoading"
            @blur="validateField('password')"
          />
          <p v-if="errors.password" class="field-error" role="alert">
            {{ errors.password }}
          </p>
        </el-form-item>

        <!-- Confirm Password -->
        <el-form-item label="Xác nhận mật khẩu" class="form-item">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            :disabled="authStore.isLoading"
            @blur="validateField('confirmPassword')"
          />
          <p v-if="errors.confirmPassword" class="field-error" role="alert">
            {{ errors.confirmPassword }}
          </p>
        </el-form-item>

        <!-- API-level error -->
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
          {{ authStore.isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản' }}
        </el-button>
      </el-form>

      <!-- Footer link -->
      <p class="register-footer">
        Đã có tài khoản?
        <router-link to="/login" class="footer-link">Đăng nhập</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// ── Validation schema ────────────────────────────────────────────────────────
const registerSchema = yup.object({
  username: yup
    .string()
    .required('Tên đăng nhập không được để trống')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(150, 'Tên đăng nhập không được vượt quá 150 ký tự')
    .matches(/^[\w.@+-]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và các ký tự . @ + - _'),
  email: yup
    .string()
    .required('Email không được để trống')
    .email('Địa chỉ email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu không được để trống')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
})

// ── VeeValidate setup ────────────────────────────────────────────────────────
const { handleSubmit: veeHandleSubmit, errors, validateField, defineField } = useForm({
  validationSchema: registerSchema,
})

const [usernameField] = defineField('username')
const [emailField] = defineField('email')
const [passwordField] = defineField('password')
const [confirmPasswordField] = defineField('confirmPassword')

const formData = reactive({
  get username() { return usernameField.value ?? '' },
  set username(v) { usernameField.value = v },
  get email() { return emailField.value ?? '' },
  set email(v) { emailField.value = v },
  get password() { return passwordField.value ?? '' },
  set password(v) { passwordField.value = v },
  get confirmPassword() { return confirmPasswordField.value ?? '' },
  set confirmPassword(v) { confirmPasswordField.value = v },
})

// ── Submit handler ───────────────────────────────────────────────────────────
const handleSubmit = veeHandleSubmit(async (values) => {
  await authStore.register({
    username: values.username,
    email: values.email,
    password: values.password,
    confirmPassword: values.confirmPassword,
  })

  // AuthStore.register() calls login() internally on success,
  // so isAuthenticated will be true if everything went well.
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
/* ── Page layout ─────────────────────────────────────────────────────────── */
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.register-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-logo {
  height: 48px;
  width: auto;
  margin-bottom: 16px;
}

.register-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* ── Form ────────────────────────────────────────────────────────────────── */
.register-form {
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
.register-footer {
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
  .register-card {
    padding: 28px 20px;
  }

  .register-title {
    font-size: 20px;
  }
}
</style>
