import * as yup from 'yup'

/**
 * Yup validation schema for TaskForm.
 *
 * Fields:
 * - title: required, max 200 characters
 * - description: optional string
 * - status: required, one of 'todo' | 'in_progress' | 'done'
 * - priority: required, one of 'low' | 'medium' | 'high'
 * - assignee: optional, nullable string
 */
export const taskSchema = yup.object({
  title: yup
    .string()
    .required('Tiêu đề không được để trống')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: yup.string().optional(),
  status: yup
    .string()
    .oneOf(['todo', 'in_progress', 'done'], 'Trạng thái không hợp lệ')
    .required('Trạng thái là bắt buộc'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Độ ưu tiên không hợp lệ')
    .required('Độ ưu tiên là bắt buộc'),
  assignee: yup.string().optional().nullable(),
})

/**
 * Yup validation schema for ProjectForm.
 *
 * Fields:
 * - name: required string (project name)
 * - description: optional string
 */
export const projectSchema = yup.object({
  name: yup.string().required('Tên dự án không được để trống'),
  description: yup.string().optional(),
})
