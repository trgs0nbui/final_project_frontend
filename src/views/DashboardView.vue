<script setup>
/**
 * DashboardView — trang chính hiển thị danh sách dự án của người dùng.
 *
 * Yêu cầu: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 10.1, 10.2, 10.3, 10.4
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/projects'
import ProjectCard from '@/components/project/ProjectCard.vue'
import ProjectForm from '@/components/project/ProjectForm.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const router = useRouter()
const projectStore = useProjectStore()

// ── State ────────────────────────────────────────────────────────────────────

/** Kiểm soát hiển thị dialog tạo/chỉnh sửa dự án */
const isFormVisible = ref(false)

/** Dự án đang được chỉnh sửa; null khi tạo mới */
const editingProject = ref(null)

// ── Computed ─────────────────────────────────────────────────────────────────

/** Danh sách dự án từ store */
const projects = computed(() => projectStore.projects)

/** Trạng thái loading từ store */
const isLoading = computed(() => projectStore.isLoading)

/** Thông báo lỗi từ store */
const storeError = computed(() => projectStore.error)

/** Tiêu đề trang với số lượng dự án */
const pageTitle = computed(() =>
  projects.value.length > 0
    ? `Dự án của tôi (${projects.value.length})`
    : 'Dự án của tôi',
)

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await projectStore.fetchProjects()
})

// ── Handlers ─────────────────────────────────────────────────────────────────

/** Điều hướng đến trang chi tiết dự án khi click card */
function handleCardClick(project) {
  router.push(`/projects/${project.id}`)
}

/** Mở dialog tạo dự án mới */
function openCreateForm() {
  editingProject.value = null
  isFormVisible.value = true
}

/** Xử lý submit form tạo/chỉnh sửa dự án */
async function handleFormSubmit(formData) {
  if (editingProject.value) {
    // Chỉnh sửa — chưa triển khai trong task này
    ElMessage.info('Chức năng chỉnh sửa sẽ được triển khai sau.')
    isFormVisible.value = false
    return
  }

  // Tạo mới
  const created = await projectStore.createProject(formData)
  if (created) {
    ElMessage.success('Tạo dự án thành công!')
    isFormVisible.value = false
  } else if (storeError.value) {
    ElMessage.error(storeError.value)
  }
}

/** Xác nhận và xóa dự án */
async function handleDeleteProject(project) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa dự án "${project.name}" không? Hành động này không thể hoàn tác.`,
      'Xác nhận xóa dự án',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )

    // Người dùng xác nhận xóa
    await projectStore.deleteProject(project.id)

    if (!storeError.value) {
      ElMessage.success('Xóa dự án thành công!')
    } else {
      ElMessage.error(storeError.value)
    }
  } catch {
    // Người dùng nhấn Hủy — không làm gì
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard__header">
      <h1 class="dashboard__title">{{ pageTitle }}</h1>
      <el-button
        type="primary"
        :icon="Plus"
        @click="openCreateForm"
      >
        Tạo dự án mới
      </el-button>
    </div>

    <!-- Lỗi API -->
    <el-alert
      v-if="storeError && !isLoading"
      :title="storeError"
      type="error"
      show-icon
      :closable="false"
      class="dashboard__error"
    />

    <!-- Skeleton loading (Req 6.9) -->
    <SkeletonCard v-if="isLoading" :count="6" />

    <!-- Danh sách dự án (Req 6.1, 6.3) -->
    <template v-else-if="projects.length > 0">
      <div class="project-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @click="handleCardClick"
          @delete="handleDeleteProject"
        />
      </div>
    </template>

    <!-- Trạng thái rỗng -->
    <el-empty
      v-else
      description="Bạn chưa có dự án nào. Hãy tạo dự án đầu tiên!"
      class="dashboard__empty"
    >
      <el-button type="primary" :icon="Plus" @click="openCreateForm">
        Tạo dự án mới
      </el-button>
    </el-empty>

    <!-- Dialog tạo/chỉnh sửa dự án (Req 6.5) -->
    <ProjectForm
      v-model:visible="isFormVisible"
      :project="editingProject"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.dashboard__title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.dashboard__error {
  margin-bottom: 20px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.dashboard__empty {
  margin-top: 60px;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .dashboard__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
