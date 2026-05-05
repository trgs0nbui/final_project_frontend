import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/services/apiClient'

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} created_at  // ISO 8601
 * @property {string} updated_at  // ISO 8601
 */

export const useProjectStore = defineStore(
  'projects',
  () => {
    // State
    const projects = ref([]) // Project[]
    const currentProject = ref(null) // Project | null
    const isLoading = ref(false)
    const error = ref(null)
    const pagination = ref({
      page: 1,
      pageSize: 20,
      total: 0,
    })

    // Getters

    /**
     * Returns a function that finds a project by id from the projects array.
     * Returns undefined if not found.
     * @type {import('vue').ComputedRef<(id: number) => Project | undefined>}
     */
    const projectById = computed(() => (id) => projects.value.find((p) => p.id === id))

    // Actions

    /**
     * Fetch all projects from the API.
     * GET /api/projects/
     * Updates projects state and pagination.total if API returns a count field.
     */
    async function fetchProjects() {
      isLoading.value = true
      error.value = null

      try {
        const response = await apiClient.get('/api/projects/')
        const data = response.data

        // Support both paginated (DRF default: { count, results }) and plain array responses
        if (Array.isArray(data)) {
          projects.value = data
        } else {
          projects.value = data.results ?? data
          if (data.count !== undefined) {
            pagination.value.total = data.count
          }
        }
      } catch (err) {
        error.value = err.message || 'Không thể tải danh sách dự án.'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Fetch a single project by id.
     * GET /api/projects/:id/
     * Updates currentProject state.
     * @param {number} id - Project id
     */
    async function fetchProjectById(id) {
      isLoading.value = true
      error.value = null

      try {
        const response = await apiClient.get(`/api/projects/${id}/`)
        currentProject.value = response.data
      } catch (err) {
        error.value = err.message || 'Không thể tải thông tin dự án.'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Create a new project.
     * POST /api/projects/
     * Adds the new project to the projects array.
     * @param {{ name: string, description: string }} data - Project data
     * @returns {Project | undefined} The created project, or undefined on failure
     */
    async function createProject(data) {
      isLoading.value = true
      error.value = null

      try {
        const response = await apiClient.post('/api/projects/', {
          name: data.name,
          description: data.description,
        })
        const newProject = response.data
        projects.value.push(newProject)
        return newProject
      } catch (err) {
        error.value = err.message || 'Không thể tạo dự án.'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Delete a project by id.
     * DELETE /api/projects/:id/
     * Removes the project from the projects array.
     * @param {number} id - Project id
     */
    async function deleteProject(id) {
      isLoading.value = true
      error.value = null

      try {
        await apiClient.delete(`/api/projects/${id}/`)
        projects.value = projects.value.filter((p) => p.id !== id)

        // Clear currentProject if it was the deleted one
        if (currentProject.value?.id === id) {
          currentProject.value = null
        }
      } catch (err) {
        error.value = err.message || 'Không thể xóa dự án.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      // State
      projects,
      currentProject,
      isLoading,
      error,
      pagination,
      // Getters
      projectById,
      // Actions
      fetchProjects,
      fetchProjectById,
      createProject,
      deleteProject,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      paths: ['currentProject'],
    },
  },
)
