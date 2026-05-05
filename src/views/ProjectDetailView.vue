<script setup>
/**
 * ProjectDetailView — trang chi tiết dự án.
 *
 * Hiển thị thông tin dự án và danh sách công việc dưới dạng KanbanBoard hoặc TaskTable.
 * Hỗ trợ tạo, chỉnh sửa, xóa task và kéo thả để thay đổi trạng thái.
 *
 * Yêu cầu: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 8.6, 8.7, 8.8, 8.9, 10.1, 10.4, 10.5, 10.6, 10.7
 */
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid, List, UserFilled } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import { useAuthStore } from '@/stores/auth'
import { handleApiError } from '@/utils/errorHandler'
import KanbanBoard from '@/components/task/KanbanBoard.vue'
import TaskTable from '@/components/task/TaskTable.vue'
import TaskForm from '@/components/task/TaskForm.vue'
import MemberSearchDialog from '@/components/project/MemberSearchDialog.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()

// ── provide/inject: chia sẻ projectId với deeply nested components (Req 10.7) ──

const projectId = computed(() => route.params.id)
provide('projectId', projectId)

// ── State ────────────────────────────────────────────────────────────────────

/** Chế độ hiển thị: 'kanban' hoặc 'table' (Req 7.5) */
const viewMode = ref('kanban')

/** Kiểm soát hiển thị dialog TaskForm */
const isTaskFormVisible = ref(false)

/** Task đang được chỉnh sửa; null khi tạo mới */
const editingTask = ref(null)

/** Chế độ form: 'create' hoặc 'edit' */
const formMode = ref('create')

/** Trạng thái đang xử lý submit form */
const isSubmitting = ref(false)

// ── Computed ─────────────────────────────────────────────────────────────────

/** Danh sách tasks từ store */
const tasks = computed(() => taskStore.tasks)

/** Trạng thái loading của task store */
const isTaskLoading = computed(() => taskStore.isLoading)

/** Trạng thái loading của project store */
const isProjectLoading = computed(() => projectStore.isLoading)

/** Thông tin dự án hiện tại */
const currentProject = computed(() => projectStore.currentProject)

/** Kiểm tra user hiện tại có phải owner của project không */
const isOwner = computed(() =>
  currentProject.value && authStore.user
    ? String(currentProject.value.owner?.id) === String(authStore.user.id)
    : false,
)

/** Kiểm soát hiển thị dialog thêm thành viên */
const isMemberDialogVisible = ref(false)

/** Tiêu đề trang */
const pageTitle = computed(() =>
  currentProject.value ? currentProject.value.name : 'Chi tiết dự án',
)

/** Tiêu đề dialog TaskForm */
const dialogTitle = computed(() =>
  formMode.value === 'edit' ? 'Chỉnh sửa công việc' : 'Tạo công việc mới',
)

// ── Data fetching ─────────────────────────────────────────────────────────────

/**
 * Fetch project details và tasks cho project hiện tại.
 * @param {string|number} id - Project ID
 */
async function fetchProjectData(id) {
  if (!id) return

  try {
    await Promise.all([
      projectStore.fetchProjectById(id),
      taskStore.fetchTasks(id),
    ])

    // Xử lý lỗi từ store sau khi fetch
    if (projectStore.error) {
      handleApiError({ message: projectStore.error }, true)
    }
    if (taskStore.error) {
      handleApiError({ message: taskStore.error }, true)
    }
  } catch (err) {
    handleApiError(err, true)
  }
}

// ── Lifecycle (Req 10.4) ──────────────────────────────────────────────────────

onMounted(async () => {
  await fetchProjectData(route.params.id)
})

// ── Watch route params (Req 10.6) ─────────────────────────────────────────────

/**
 * Theo dõi thay đổi route params để fetch lại dữ liệu khi chuyển project.
 * Watcher được tự động dọn dẹp khi component unmount (Req 10.5).
 */
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await fetchProjectData(newId)
    }
  },
)

// ── View toggle (Req 7.5) ─────────────────────────────────────────────────────

function setViewMode(mode) {
  viewMode.value = mode
}

// ── Drag & drop handler (Req 7.4) ─────────────────────────────────────────────

/**
 * Xử lý khi task được kéo thả sang cột khác trong KanbanBoard.
 * Gọi TaskStore.patchTask() để cập nhật status qua PATCH API.
 * @param {number} taskId
 * @param {string} newStatus
 */
async function handleTaskMoved(taskId, newStatus) {
  try {
    const updated = await taskStore.patchTask(taskId, { status: newStatus })
    if (updated) {
      ElMessage.success('Cập nhật trạng thái công việc thành công!')
    } else if (taskStore.error) {
      ElMessage.error(taskStore.error)
    }
  } catch (err) {
    handleApiError(err, true)
  }
}

// ── Task CRUD ─────────────────────────────────────────────────────────────────

/** Mở dialog tạo task mới (Req 8.6) */
function openCreateTask() {
  editingTask.value = null
  formMode.value = 'create'
  isTaskFormVisible.value = true
}

/**
 * Mở dialog chỉnh sửa task (Req 8.7).
 * @param {Object} task - Task cần chỉnh sửa
 */
function openEditTask(task) {
  editingTask.value = task
  formMode.value = 'edit'
  isTaskFormVisible.value = true
}

/** Đóng dialog TaskForm */
function closeTaskForm() {
  isTaskFormVisible.value = false
  editingTask.value = null
}

/**
 * Xử lý submit TaskForm — tạo mới hoặc cập nhật task.
 * @param {Object} formData - Dữ liệu từ TaskForm
 */
async function handleTaskFormSubmit(formData) {
  isSubmitting.value = true
  try {
    if (formMode.value === 'edit' && editingTask.value) {
      // Chỉnh sửa task (Req 8.7)
      const updated = await taskStore.updateTask(editingTask.value.id, formData)
      if (updated) {
        ElMessage.success('Cập nhật công việc thành công!')
        closeTaskForm()
      } else if (taskStore.error) {
        ElMessage.error(taskStore.error)
      }
    } else {
      // Tạo task mới (Req 8.6)
      const created = await taskStore.createTask(route.params.id, formData)
      if (created) {
        ElMessage.success('Tạo công việc thành công!')
        closeTaskForm()
      } else if (taskStore.error) {
        ElMessage.error(taskStore.error)
      }
    }
  } catch (err) {
    handleApiError(err, true)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Xác nhận và xóa task (Req 8.8).
 * @param {Object} task - Task cần xóa
 */
async function handleDeleteTask(task) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa công việc "${task.title}" không? Hành động này không thể hoàn tác.`,
      'Xác nhận xóa công việc',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      },
    )

    // Người dùng xác nhận xóa
    await taskStore.deleteTask(task.id)

    if (!taskStore.error) {
      ElMessage.success('Xóa công việc thành công!') // Req 8.9
    } else {
      ElMessage.error(taskStore.error)
    }
  } catch {
    // Người dùng nhấn Hủy — không làm gì
  }
}
</script>

<template>
  <div class="project-detail">
    <!-- Loading toàn trang khi fetch project lần đầu -->
    <div v-if="isProjectLoading && !currentProject" class="project-detail__page-loading">
      <LoadingSpinner size="large" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="project-detail__header">
        <div class="project-detail__title-group">
          <el-button
            text
            class="project-detail__back-btn"
            @click="router.push('/dashboard')"
          >
            ← Quay lại
          </el-button>
          <h1 class="project-detail__title">{{ pageTitle }}</h1>
          <p v-if="currentProject?.description" class="project-detail__description">
            {{ currentProject.description }}
          </p>
        </div>

        <div class="project-detail__actions">
          <!-- Nút chuyển đổi view (Req 7.5) -->
          <el-button-group class="project-detail__view-toggle">
            <el-button
              :type="viewMode === 'kanban' ? 'primary' : 'default'"
              :icon="Grid"
              title="Kanban view"
              @click="setViewMode('kanban')"
            >
              Kanban
            </el-button>
            <el-button
              :type="viewMode === 'table' ? 'primary' : 'default'"
              :icon="List"
              title="Table view"
              @click="setViewMode('table')"
            >
              Bảng
            </el-button>
          </el-button-group>

          <!-- Nút thêm thành viên — chỉ hiển thị với owner -->
          <el-button
            v-if="isOwner"
            :icon="UserFilled"
            @click="isMemberDialogVisible = true"
          >
            Thêm thành viên
          </el-button>

          <!-- Nút tạo task mới (Req 8.6) -->
          <el-button
            type="primary"
            :icon="Plus"
            @click="openCreateTask"
          >
            Tạo công việc
          </el-button>
        </div>
      </div>

      <!-- Lỗi API -->
      <el-alert
        v-if="taskStore.error && !isTaskLoading"
        :title="taskStore.error"
        type="error"
        show-icon
        :closable="false"
        class="project-detail__error"
      />

      <!-- Kanban view (Req 7.1, 7.3, 7.4) -->
      <KanbanBoard
        v-if="viewMode === 'kanban'"
        :tasks="tasks"
        :is-loading="isTaskLoading"
        @task-moved="handleTaskMoved"
        @edit-task="openEditTask"
        @delete-task="handleDeleteTask"
      />

      <!-- Table view (Req 7.6, 7.7) -->
      <TaskTable
        v-else
        :tasks="tasks"
        :is-loading="isTaskLoading"
        @edit-task="openEditTask"
        @delete-task="handleDeleteTask"
      />
    </template>

    <!-- Dialog TaskForm (Req 8.6, 8.7) -->
    <el-dialog
      v-model="isTaskFormVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
      :close-on-press-escape="!isSubmitting"
      destroy-on-close
      @close="closeTaskForm"
    >
      <TaskForm
        v-if="isTaskFormVisible"
        :task="editingTask"
        :project-id="String(route.params.id)"
        :mode="formMode"
        @submit="handleTaskFormSubmit"
        @cancel="closeTaskForm"
      />
    </el-dialog>

    <!-- Dialog thêm thành viên (chỉ owner) -->
    <MemberSearchDialog
      v-if="isOwner"
      v-model:visible="isMemberDialogVisible"
      :project-id="String(route.params.id)"
      @member-added="() => {}"
    />
  </div>
</template>

<style scoped>
.project-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.project-detail__page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.project-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.project-detail__title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-detail__back-btn {
  align-self: flex-start;
  padding: 0;
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.project-detail__title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.project-detail__description {
  font-size: 14px;
  color: #606266;
  margin: 0;
  max-width: 600px;
}

.project-detail__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.project-detail__view-toggle {
  flex-shrink: 0;
}

.project-detail__error {
  margin-bottom: 20px;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .project-detail__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-detail__actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
