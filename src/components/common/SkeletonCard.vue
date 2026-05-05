<script setup>
defineProps({
  count: {
    type: Number,
    default: 6,
  },
})
</script>

<template>
  <div class="skeleton-grid">
    <div v-for="n in count" :key="n" class="skeleton-card-wrapper">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-card">
            <!-- Title area -->
            <el-skeleton-item variant="h3" class="skeleton-title" />

            <!-- Description lines -->
            <el-skeleton-item variant="text" class="skeleton-desc-line" />
            <el-skeleton-item variant="text" class="skeleton-desc-line skeleton-desc-line--short" />

            <!-- Footer: task count + date -->
            <div class="skeleton-footer">
              <el-skeleton-item variant="text" class="skeleton-footer-left" />
              <el-skeleton-item variant="text" class="skeleton-footer-right" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.skeleton-card-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-card {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  width: 60%;
  height: 22px;
}

.skeleton-desc-line {
  width: 100%;
  height: 14px;
}

.skeleton-desc-line--short {
  width: 75%;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.skeleton-footer-left {
  width: 30%;
  height: 14px;
}

.skeleton-footer-right {
  width: 35%;
  height: 14px;
}
</style>
