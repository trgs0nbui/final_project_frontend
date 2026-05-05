<script setup>
/**
 * ProjectCard — hiển thị thông tin tóm tắt của một dự án.
 *
 * Props:
 *   project {Project} — đối tượng dự án cần hiển thị
 *
 * Emits:
 *   click (project) — khi người dùng nhấn vào card
 *   delete (project) — khi người dùng nhấn nút xóa
 */
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'delete'])

/**
 * Định dạng ngày ISO 8601 thành chuỗi ngày/tháng/năm tiếng Việt.
 * @param {string} isoString
 * @returns {string}
 */
const formattedDate = computed(() => {
  if (!props.project.created_at) return '—'
  return new Date(props.project.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})

/**
 * Số lượng task của dự án (nếu API trả về trường task_count hoặc tasks[]).
 * Trả về null nếu backend không cung cấp dữ liệu — tránh hiển thị số sai.
 */
const taskCount = computed(() => {
  if (typeof props.project.task_count === 'number') return props.project.task_count
  if (Array.isArray(props.project.tasks)) return props.project.tasks.length
  return null
})

function handleCardClick() {
  emit('click', props.project)
}

function handleDelete(event) {
  // Ngăn sự kiện click card lan lên
  event.stopPropagation()
  emit('delete', props.project)
}
</script>

<template>
  <el-card
    class="project-card"
    shadow="hover"
    @click="handleCardClick"
  >
    <div class="project-card__body">
      <!-- Tên dự án -->
      <h3 class="project-card__name">{{ project.name }}</h3>

      <!-- Mô tả -->
      <p class="project-card__description">
        {{ project.description || 'Chưa có mô tả' }}
      </p>

      <!-- Footer: số task + ngày tạo + nút xóa -->
      <div class="project-card__footer">
        <div class="project-card__meta">
          <span class="project-card__task-count">
            <el-icon class="meta-icon"><i class="el-icon-tickets" /></el-icon>
            {{ taskCount !== null ? `${taskCount} công việc` : 'Chưa có dữ liệu công việc' }}
          </span>
          <span class="project-card__date">
            Tạo ngày {{ formattedDate }}
          </span>
        </div>

        <el-button
          type="danger"
          :icon="Delete"
          size="small"
          circle
          class="project-card__delete-btn"
          title="Xóa dự án"
          @click="handleDelete"
        />
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.project-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 10px;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-2px);
}

.project-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.project-card__name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  /* Giới hạn 2 dòng */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card__description {
  font-size: 13px;
  color: #606266;
  margin: 0;
  flex: 1;
  /* Giới hạn 3 dòng */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.project-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.project-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-card__task-count,
.project-card__date {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 13px;
}

.project-card__delete-btn {
  flex-shrink: 0;
}
</style>
