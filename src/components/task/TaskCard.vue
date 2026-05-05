<script setup>
/**
 * TaskCard — hiển thị thông tin tóm tắt của một công việc trong Kanban board.
 *
 * Component này được thiết kế để dùng bên trong VueDraggable (vue-draggable-plus),
 * nên bản thân nó không cần thêm thuộc tính draggable — container cha sẽ xử lý.
 *
 * Props:
 *   task {Task} — đối tượng công việc cần hiển thị
 *
 * Emits:
 *   edit (task)   — khi người dùng nhấn nút chỉnh sửa
 *   delete (task) — khi người dùng nhấn nút xóa
 */
import { computed } from 'vue'
import { Edit, Delete, User } from '@element-plus/icons-vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])

/** Map trạng thái sang nhãn tiếng Việt và màu Element Plus tag */
const STATUS_MAP = {
  todo: { label: 'Chờ xử lý', type: 'info' },
  in_progress: { label: 'Đang thực hiện', type: 'warning' },
  done: { label: 'Hoàn thành', type: 'success' },
}

/** Map độ ưu tiên sang nhãn tiếng Việt và màu Element Plus tag */
const PRIORITY_MAP = {
  low: { label: 'Thấp', type: 'info' },
  medium: { label: 'Trung bình', type: 'warning' },
  high: { label: 'Cao', type: 'danger' },
}

const statusInfo = computed(() => STATUS_MAP[props.task.status] ?? { label: props.task.status, type: 'info' })
const priorityInfo = computed(() => PRIORITY_MAP[props.task.priority] ?? { label: props.task.priority, type: 'info' })

function handleEdit(event) {
  event.stopPropagation()
  emit('edit', props.task)
}

function handleDelete(event) {
  event.stopPropagation()
  emit('delete', props.task)
}
</script>

<template>
  <el-card
    class="task-card"
    shadow="hover"
    :body-style="{ padding: '12px' }"
  >
    <!-- Tiêu đề -->
    <p class="task-card__title">{{ task.title }}</p>

    <!-- Mô tả (nếu có) -->
    <p v-if="task.description" class="task-card__description">
      {{ task.description }}
    </p>

    <!-- Tags: trạng thái + độ ưu tiên -->
    <div class="task-card__tags">
      <el-tag :type="statusInfo.type" size="small" round>
        {{ statusInfo.label }}
      </el-tag>
      <el-tag :type="priorityInfo.type" size="small" round effect="plain">
        {{ priorityInfo.label }}
      </el-tag>
    </div>

    <!-- Footer: người được giao + actions -->
    <div class="task-card__footer">
      <!-- Người được giao -->
      <span v-if="task.assignee" class="task-card__assignee">
        <el-icon><User /></el-icon>
        {{ task.assignee.username }}
      </span>
      <span v-else class="task-card__assignee task-card__assignee--empty">
        Chưa giao
      </span>

      <!-- Nút hành động -->
      <div class="task-card__actions">
        <el-button
          type="primary"
          :icon="Edit"
          size="small"
          circle
          title="Chỉnh sửa"
          @click="handleEdit"
        />
        <el-button
          type="danger"
          :icon="Delete"
          size="small"
          circle
          title="Xóa"
          @click="handleDelete"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.task-card {
  cursor: grab;
  border-radius: 8px;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  user-select: none;
}

.task-card:active {
  cursor: grabbing;
}

/* Lớp được thêm bởi SortableJS khi đang kéo */
.task-card.sortable-ghost {
  opacity: 0.4;
  background: #e6f0ff;
}

.task-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
  line-height: 1.4;
  /* Giới hạn 2 dòng */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card__description {
  font-size: 12px;
  color: #606266;
  margin: 0 0 8px;
  line-height: 1.5;
  /* Giới hạn 2 dòng */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.task-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.task-card__assignee {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-card__assignee--empty {
  color: #c0c4cc;
  font-style: italic;
}

.task-card__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
</style>
