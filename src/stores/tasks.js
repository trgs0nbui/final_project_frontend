import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {'todo' | 'in_progress' | 'done'} status
 * @property {'low' | 'medium' | 'high'} priority
 * @property {string | null} assignee
 * @property {number} project_id
 * @property {string} created_at  // ISO 8601
 * @property {string} updated_at  // ISO 8601
 */

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref([]) // Task[]
  const currentTask = ref(null) // Task | null
  const isLoading = ref(false)
  const error = ref(null)

  // Getters

  /**
   * Returns a function that filters tasks by status.
   * @type {import('vue').ComputedRef<(status: string) => Task[]>}
   */
  const tasksByStatus = computed(() => (status) => tasks.value.filter((t) => t.status === status))

  // Actions

  /**
   * Fetch all tasks for a given project.
   * GET /api/projects/:projectId/tasks/
   * Updates tasks state.
   * @param {number} projectId - Project id
   */
  async function fetchTasks(projectId) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.get(`/api/projects/${projectId}/tasks/`)
      const data = response.data

      // Support both paginated (DRF default: { count, results }) and plain array responses
      if (Array.isArray(data)) {
        tasks.value = data
      } else {
        tasks.value = data.results ?? data
      }
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách công việc.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new task in a project.
   * POST /api/projects/:projectId/tasks/
   * Adds the new task to the tasks array.
   * @param {number} projectId - Project id
   * @param {Object} data - Task data
   * @returns {Task | undefined} The created task, or undefined on failure
   */
  async function createTask(projectId, data) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.post(`/api/projects/${projectId}/tasks/`, data)
      const newTask = response.data
      tasks.value.push(newTask)
      return newTask
    } catch (err) {
      error.value = err.message || 'Không thể tạo công việc.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a task with full data (PUT).
   * PUT /api/tasks/:taskId/
   * Replaces the task in the tasks array with the updated data from the API response.
   * @param {number} taskId - Task id
   * @param {Object} data - Full task data
   * @returns {Task | undefined} The updated task, or undefined on failure
   */
  async function updateTask(taskId, data) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.put(`/api/tasks/${taskId}/`, data)
      const updatedTask = response.data
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err) {
      error.value = err.message || 'Không thể cập nhật công việc.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Partially update a task (PATCH) — used for drag & drop status change.
   * PATCH /api/tasks/:taskId/
   * Replaces the task in the tasks array with the updated data from the API response.
   * @param {number} taskId - Task id
   * @param {Object} data - Partial task data
   * @returns {Task | undefined} The updated task, or undefined on failure
   */
  async function patchTask(taskId, data) {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.patch(`/api/tasks/${taskId}/`, data)
      const updatedTask = response.data
      const index = tasks.value.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err) {
      error.value = err.message || 'Không thể cập nhật công việc.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a task by id.
   * DELETE /api/tasks/:taskId/
   * Removes the task from the tasks array.
   * @param {number} taskId - Task id
   */
  async function deleteTask(taskId) {
    isLoading.value = true
    error.value = null

    try {
      await apiClient.delete(`/api/tasks/${taskId}/`)
      tasks.value = tasks.value.filter((t) => t.id !== taskId)

      // Clear currentTask if it was the deleted one
      if (currentTask.value?.id === taskId) {
        currentTask.value = null
      }
    } catch (err) {
      error.value = err.message || 'Không thể xóa công việc.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,
    // Getters
    tasksByStatus,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
  }
})
