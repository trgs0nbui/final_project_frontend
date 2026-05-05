<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppNavBar from '@/components/common/AppNavBar.vue'

const authStore = useAuthStore()
</script>

<template>
  <el-container class="app-layout">
    <el-header v-if="authStore.isAuthenticated" class="app-header">
      <AppNavBar />
    </el-header>

    <el-main class="app-main">
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  flex-direction: column;
}

.app-header {
  padding: 0;
  height: auto;
}

.app-main {
  padding: 24px;
  flex: 1;
}
</style>
