<script setup>
/**
 * KanbanColumn — một cột trong Kanban board.
 *
 * Sử dụng VueDraggable (vue-draggable-plus) để cho phép kéo thả TaskCard
 * giữa các cột. Khi một task được thả vào cột này, component emit sự kiện
 * `task-dropped` lên KanbanBoard để xử lý cập nhật trạng thái.
 *
 * Props:
 *   title  {string}  — tiêu đề hiển thị của cột
 *   status {string}  — giá trị status tương ứng ('todo' | 'in_progress' | 'done')
 *   tasks  {Task[]}  — danh sách task thuộc cột này
 *
 * Emits:
 *   task-dropped (taskId, newStatus) — khi task được kéo thả vào cột
 *   edit-task    (task)              — chuyển tiếp từ TaskCard
 *   delete-task  (task)              — chuyển tiếp từ TaskCard
 */
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    validator: (v) => ['todo', 'in_progress', 'done'].includes(v),
  },
  tasks: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['task-dropped', 'edit-task', 'delete-task'])

/** Map status sang màu header cột */
const COLUMN_COLOR_MAP = {
  todo: '#909399',
  in_progress: '#e6a23c',
  done: '#67c23a',
}

const headerColor = COLUMN_COLOR_MAP[props.status] ?? '#409eff'

/**
 * Local copy of the tasks list for VueDraggable.
 * VueDraggable needs a writable ref — we cannot v-model a prop directly.
 * We use a computed with get/set: reads from props, writes are intercepted
 * so we can emit the task-dropped event instead of mutating the prop.
 */
const localTasks = computed({
  get: () => props.tasks,
  set: () => {
    // Intentionally a no-op: actual state updates happen via task-dropped emit
    // which triggers TaskStore.patchTask() in the parent view.
  },
})

/**
 * Được gọi bởi VueDraggable khi một item được thêm vào cột này
 * (tức là kéo từ cột khác sang).
 * @param {Object} event - SortableJS add event
 */
function onAdd(event) {
  // event.item là DOM element của task card được kéo
  // Lấy taskId từ data attribute được gán trong TaskCard wrapper
  const taskId = Number(event.item.dataset.taskId)
  if (taskId) {
    emit('task-dropped', taskId, props.status)
  }
}
</script>

<template>
  <div class="kanban-column" :aria-label="`Cột ${title}`">
    <!-- Header cột -->
    <div class="kanban-column__header" :style="{ borderTopColor: headerColor }">
      <span class="kanban-column__title">{{ title }}</span>
      <el-badge
        :value="tasks.length"
        :max="99"
        class="kanban-column__count"
        type="info"
      />
    </div>

    <!-- Danh sách task có thể kéo thả -->
    <VueDraggable
      v-model="localTasks"
      :group="{ name: 'kanban', pull: true, put: true }"
      class="kanban-column__list"
      ghost-class="task-card--ghost"
      drag-class="task-card--dragging"
      :animation="200"
      @add="onAdd"
    >
      <div
        v-for="task in localTasks"
        :key="task.id"
        :data-task-id="task.id"
        class="kanban-column__item"
      >
        <TaskCard
          :task="task"
          @edit="(t) => emit('edit-task', t)"
          @delete="(t) => emit('delete-task', t)"
        />
      </div>
    </VueDraggable>

    <!-- Placeholder khi cột rỗng -->
    <div v-if="tasks.length === 0" class="kanban-column__empty">
      <span>Không có công việc</span>
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-radius: 10px;
  min-width: 0;
  flex: 1;
  min-height: 200px;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-top: 3px solid #409eff;
  border-radius: 10px 10px 0 0;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.kanban-column__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.kanban-column__count {
  flex-shrink: 0;
}

.kanban-column__list {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
  /* Cho phép SortableJS nhận diện vùng thả khi cột rỗng */
  overflow-y: auto;
}

.kanban-column__item {
  /* Wrapper cần thiết để SortableJS đọc data-task-id */
}

.kanban-column__empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #c0c4cc;
  font-style: italic;
}

/* Ghost class khi đang kéo */
:deep(.task-card--ghost) {
  opacity: 0.35;
  background: #d9ecff;
  border: 1px dashed #409eff;
  border-radius: 8px;
}

/* Class khi item đang được kéo (clone) */
:deep(.task-card--dragging) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: rotate(1.5deg);
}
</style>
