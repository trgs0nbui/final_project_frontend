<script setup>
/**
 * TaskTable — hiển thị danh sách công việc dưới dạng bảng.
 *
 * Hỗ trợ lọc theo status và priority thông qua dropdown filter.
 * Người dùng có thể chỉnh sửa hoặc xóa task trực tiếp từ bảng.
 *
 * Props:
 *   tasks     {Task[]}  — danh sách tất cả công việc
 *   isLoading {boolean} — hiển thị trạng thái loading của bảng
 *
 * Emits:
 *   edit-task   (task) — khi người dùng nhấn nút chỉnh sửa
 *   delete-task (task) — khi người dùng nhấn nút xóa
 */
import { ref, computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'

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

const emit = defineEmits(['edit-task', 'delete-task'])

// ─── Filter state ────────────────────────────────────────────────────────────

const filterStatus = ref('')
const filterPriority = ref('')

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Chờ xử lý', value: 'todo' },
  { label: 'Đang thực hiện', value: 'in_progress' },
  { label: 'Hoàn thành', value: 'done' },
]

const PRIORITY_OPTIONS = [
  { label: 'Tất cả độ ưu tiên', value: '' },
  { label: 'Thấp', value: 'low' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Cao', value: 'high' },
]

/** Danh sách task sau khi áp dụng filter */
const filteredTasks = computed(() => {
  return props.tasks.filter((task) => {
    const matchStatus = filterStatus.value === '' || task.status === filterStatus.value
    const matchPriority = filterPriority.value === '' || task.priority === filterPriority.value
    return matchStatus && matchPriority
  })
})

// ─── Display helpers ─────────────────────────────────────────────────────────

const STATUS_MAP = {
  todo: { label: 'Chờ xử lý', type: 'info' },
  in_progress: { label: 'Đang thực hiện', type: 'warning' },
  done: { label: 'Hoàn thành', type: 'success' },
}

const PRIORITY_MAP = {
  low: { label: 'Thấp', type: 'info' },
  medium: { label: 'Trung bình', type: 'warning' },
  high: { label: 'Cao', type: 'danger' },
}

/**
 * Định dạng ngày ISO 8601 thành chuỗi ngày/tháng/năm tiếng Việt.
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getStatusInfo(status) {
  return STATUS_MAP[status] ?? { label: status, type: 'info' }
}

function getPriorityInfo(priority) {
  return PRIORITY_MAP[priority] ?? { label: priority, type: 'info' }
}
</script>

<template>
  <div class="task-table">
    <!-- Thanh filter -->
    <div class="task-table__filters" role="search" aria-label="Lọc công việc">
      <el-select
        v-model="filterStatus"
        placeholder="Trạng thái"
        size="default"
        clearable
        class="task-table__filter-select"
        aria-label="Lọc theo trạng thái"
      >
        <el-option
          v-for="opt in STATUS_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-select
        v-model="filterPriority"
        placeholder="Độ ưu tiên"
        size="default"
        clearable
        class="task-table__filter-select"
        aria-label="Lọc theo độ ưu tiên"
      >
        <el-option
          v-for="opt in PRIORITY_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <span class="task-table__count" aria-live="polite">
        {{ filteredTasks.length }} / {{ tasks.length }} công việc
      </span>
    </div>

    <!-- Bảng dữ liệu -->
    <el-table
      :data="filteredTasks"
      v-loading="isLoading"
      element-loading-text="Đang tải..."
      stripe
      border
      style="width: 100%"
      empty-text="Không có công việc nào"
      row-key="id"
    >
      <!-- Tiêu đề -->
      <el-table-column
        prop="title"
        label="Tiêu đề"
        min-width="200"
        show-overflow-tooltip
      />

      <!-- Trạng thái -->
      <el-table-column
        prop="status"
        label="Trạng thái"
        width="150"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="getStatusInfo(row.status).type" size="small" round>
            {{ getStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- Độ ưu tiên -->
      <el-table-column
        prop="priority"
        label="Độ ưu tiên"
        width="140"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="getPriorityInfo(row.priority).type" size="small" round effect="plain">
            {{ getPriorityInfo(row.priority).label }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- Người được giao -->
      <el-table-column
        prop="assignee"
        label="Người được giao"
        width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span v-if="row.assignee">{{ row.assignee.username }}</span>
          <span v-else class="task-table__unassigned">Chưa giao</span>
        </template>
      </el-table-column>

      <!-- Ngày tạo -->
      <el-table-column
        prop="created_at"
        label="Ngày tạo"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>

      <!-- Hành động -->
      <el-table-column
        label="Hành động"
        width="110"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="task-table__actions">
            <el-button
              type="primary"
              :icon="Edit"
              size="small"
              circle
              title="Chỉnh sửa"
              @click="emit('edit-task', row)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              size="small"
              circle
              title="Xóa"
              @click="emit('delete-task', row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.task-table {
  width: 100%;
}

.task-table__filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.task-table__filter-select {
  width: 180px;
}

.task-table__count {
  font-size: 13px;
  color: #909399;
  margin-left: auto;
}

.task-table__unassigned {
  color: #c0c4cc;
  font-style: italic;
  font-size: 13px;
}

.task-table__actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* Responsive: thu nhỏ filter trên mobile */
@media (max-width: 768px) {
  .task-table__filter-select {
    width: 100%;
  }

  .task-table__count {
    margin-left: 0;
    width: 100%;
  }
}
</style>
