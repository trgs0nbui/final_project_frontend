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

    <!-- Remove padding for unauthenticated pages (login / register) so they
         can manage their own full-page layout. -->
    <el-main :class="['app-main', { 'app-main--no-padding': !authStore.isAuthenticated }]">
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

.app-main--no-padding {
  padding: 0;
}
</style>
