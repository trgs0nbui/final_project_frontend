<script setup>
/**
 * KanbanBoard — bảng Kanban 3 cột hiển thị danh sách công việc.
 *
 * Nhận toàn bộ danh sách tasks từ prop, tự phân loại vào 3 cột theo status.
 * Khi người dùng kéo thả task sang cột khác, emit `task-moved` để view cha
 * gọi TaskStore.patchTask() cập nhật trạng thái.
 *
 * Props:
 *   tasks     {Task[]}  — danh sách tất cả công việc
 *   isLoading {boolean} — hiển thị loading spinner khi true
 *
 * Emits:
 *   task-moved  (taskId, newStatus) — khi task được kéo sang cột khác
 *   edit-task   (task)              — khi người dùng nhấn nút chỉnh sửa
 *   delete-task (task)              — khi người dùng nhấn nút xóa
 */
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['task-moved', 'edit-task', 'delete-task'])

/** Định nghĩa 3 cột cố định của Kanban board */
const COLUMNS = [
  { status: 'todo', title: 'Chờ xử lý' },
  { status: 'in_progress', title: 'Đang thực hiện' },
  { status: 'done', title: 'Hoàn thành' },
]

/**
 * Phân loại tasks vào từng cột theo status.
 * Trả về Map<status, Task[]> để KanbanColumn nhận đúng danh sách.
 */
const tasksByColumn = computed(() => {
  const map = {
    todo: [],
    in_progress: [],
    done: [],
  }
  for (const task of props.tasks) {
    if (map[task.status] !== undefined) {
      map[task.status].push(task)
    }
  }
  return map
})

/**
 * Xử lý khi task được kéo thả vào một cột.
 * Chỉ emit nếu status thực sự thay đổi (tránh gọi API không cần thiết).
 * @param {number} taskId
 * @param {string} newStatus
 */
function handleTaskDropped(taskId, newStatus) {
  const task = props.tasks.find((t) => t.id === taskId)
  if (task && task.status !== newStatus) {
    emit('task-moved', taskId, newStatus)
  }
}
</script>

<template>
  <div class="kanban-board" role="region" aria-label="Kanban Board">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="kanban-board__loading" aria-live="polite">
      <LoadingSpinner size="large" />
    </div>

    <!-- Board content -->
    <div v-else class="kanban-board__columns">
      <KanbanColumn
        v-for="col in COLUMNS"
        :key="col.status"
        :title="col.title"
        :status="col.status"
        :tasks="tasksByColumn[col.status]"
        @task-dropped="handleTaskDropped"
        @edit-task="(task) => emit('edit-task', task)"
        @delete-task="(task) => emit('delete-task', task)"
      />
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  width: 100%;
  position: relative;
}

.kanban-board__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.kanban-board__columns {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
}

/* Responsive: hiển thị cột theo chiều dọc trên màn hình nhỏ */
@media (max-width: 768px) {
  .kanban-board__columns {
    flex-direction: column;
  }
}
</style>
