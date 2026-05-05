# Kế Hoạch Triển Khai: Vue 3 Frontend Setup

## Tổng Quan

Triển khai toàn bộ frontend ứng dụng quản lý dự án sử dụng Vue 3 + Vite, tích hợp với Django REST API qua JWT authentication. Các bước được thực hiện tuần tự, mỗi bước xây dựng trên nền tảng của bước trước, kết thúc bằng việc kết nối tất cả thành phần lại với nhau.

## Tasks

- [x] 1. Cài đặt dependencies và cấu hình dự án
  - Cài đặt các package cần thiết: `axios`, `element-plus`, `veevalidate`, `yup`, `pinia-plugin-persistedstate`, `vue-draggable-plus`, `vitest`, `@vue/test-utils`, `jsdom`, `fast-check`
  - Cập nhật `src/main.js` để đăng ký Element Plus, pinia-plugin-persistedstate làm plugin toàn cục
  - Tạo file `.env.example` với biến `VITE_API_BASE_URL=http://localhost:8000`
  - Tạo file `vitest.config.js` với environment jsdom và globals
  - Tạo file `src/tests/setup.js` cho global test setup
  - _Yêu cầu: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Xây dựng ApiClient và xử lý lỗi tập trung
  - [ ] 2.1 Tạo `src/services/apiClient.js` với Axios instance, request interceptor đính kèm AccessToken, response interceptor xử lý 401 và chuẩn hóa error object
    - Cấu hình `baseURL` từ `VITE_API_BASE_URL`, timeout 30 giây, header `Content-Type: application/json`
    - Request interceptor: đọc `accessToken` từ localStorage và gắn vào `Authorization: Bearer <token>`
    - Response interceptor: xử lý 401 bằng cách gọi refresh endpoint, retry request gốc; chuẩn hóa lỗi thành `{ status, message, errors }`
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 2.2 Viết property test cho Property 6: Tự động đính kèm Authorization header
    - **Property 6: Tự Động Đính Kèm Authorization Header**
    - **Validates: Yêu cầu 4.3**

  - [ ]* 2.3 Viết property test cho Property 7: Chuẩn hóa cấu trúc Error Object
    - **Property 7: Chuẩn Hóa Cấu Trúc Error Object**
    - **Validates: Yêu cầu 4.6**

  - [ ]* 2.4 Viết property test cho Property 1: Token Refresh tự động khi nhận 401
    - **Property 1: Token Refresh Tự Động Khi Nhận 401**
    - **Validates: Yêu cầu 2.6, 4.4**

  - [ ]* 2.5 Viết unit test cho edge case refresh token thất bại
    - Kiểm tra khi refresh thất bại: AuthStore.logout() được gọi, redirect về `/login`
    - _Yêu cầu: 2.7, 4.5_

  - [ ] 2.6 Tạo `src/utils/errorHandler.js` với hàm `handleApiError` mapping HTTP status sang thông báo tiếng Việt
    - _Yêu cầu: 11.2, 11.3, 11.5_

- [ ] 3. Xây dựng Pinia Stores
  - [ ] 3.1 Tạo `src/stores/auth.js` — AuthStore với đầy đủ state, actions (login, register, logout, refreshAccessToken) và persist config vào localStorage
    - State: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, `error`
    - Persist: `['user', 'accessToken', 'refreshToken', 'isAuthenticated']` vào localStorage
    - _Yêu cầu: 2.3, 2.5, 2.8, 2.9, 5.1, 5.4_

  - [ ]* 3.2 Viết property test cho Property 2: Auth State Persistence Round-Trip
    - **Property 2: Auth State Persistence Round-Trip**
    - **Validates: Yêu cầu 2.9, 5.4**

  - [ ]* 3.3 Viết unit test cho AuthStore: login thành công, logout, xử lý lỗi
    - Kiểm tra login lưu tokens, isAuthenticated = true; logout xóa tokens
    - _Yêu cầu: 2.3, 2.8_

  - [ ] 3.4 Tạo `src/stores/projects.js` — ProjectStore với state, actions (fetchProjects, fetchProjectById, createProject, deleteProject), getter `projectById`, persist `currentProject` vào sessionStorage
    - State: `projects`, `currentProject`, `isLoading`, `error`, `pagination`
    - _Yêu cầu: 5.2, 5.5, 5.6, 5.7_

  - [ ]* 3.5 Viết property test cho Property 9: Getter projectById trả về đúng Project
    - **Property 9: Getter projectById Trả Về Đúng Project**
    - **Validates: Yêu cầu 5.7**

  - [ ] 3.6 Tạo `src/stores/tasks.js` — TaskStore với state, actions (fetchTasks, createTask, updateTask, patchTask, deleteTask) và getter `tasksByStatus`
    - State: `tasks`, `currentTask`, `isLoading`, `error`
    - _Yêu cầu: 5.3, 5.6, 5.8_

  - [ ]* 3.7 Viết property test cho Property 10: Getter tasksByStatus lọc đúng theo status
    - **Property 10: Getter tasksByStatus Lọc Đúng Theo Status**
    - **Validates: Yêu cầu 5.8**

  - [ ]* 3.8 Viết property test cho Property 8: Store cập nhật error state khi API thất bại
    - **Property 8: Store Cập Nhật Error State Khi API Thất Bại**
    - **Validates: Yêu cầu 5.6**

- [ ] 4. Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [ ] 5. Cấu hình Vue Router và Navigation Guards
  - [ ] 5.1 Cập nhật `src/router/index.js` với đầy đủ routes, lazy loading, meta fields và navigation guards
    - Định nghĩa routes: `/login`, `/register`, `/dashboard`, `/projects/:id`, `/projects/:id/tasks/:taskId`, `/404`, wildcard redirect
    - `beforeEach` guard: kiểm tra `meta.requiresAuth` và `isAuthenticated`; redirect người dùng đã đăng nhập khỏi `/login`, `/register`
    - `afterEach` hook: cập nhật `document.title` theo `meta.title`
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 5.2 Viết property test cho Property 3: Auth Guard bảo vệ route yêu cầu xác thực
    - **Property 3: Auth Guard Bảo Vệ Route Yêu Cầu Xác Thực**
    - **Validates: Yêu cầu 3.3, 3.4**

  - [ ]* 5.3 Viết property test cho Property 4: Redirect người dùng đã đăng nhập khỏi auth routes
    - **Property 4: Redirect Người Dùng Đã Đăng Nhập Khỏi Auth Routes**
    - **Validates: Yêu cầu 3.5**

  - [ ]* 5.4 Viết property test cho Property 5: Cập nhật Document Title theo route
    - **Property 5: Cập Nhật Document Title Theo Route**
    - **Validates: Yêu cầu 3.7**

- [ ] 6. Xây dựng Validation Schemas
  - [ ] 6.1 Tạo `src/utils/validators.js` với Yup schema cho TaskForm (`taskSchema`) và ProjectForm (`projectSchema`)
    - `taskSchema`: title (required, max 200), description (optional), status (oneOf), priority (oneOf), assignee (optional nullable)
    - _Yêu cầu: 8.2, 8.3, 8.4_

  - [ ]* 6.2 Viết property test cho Property 12: Validation title task
    - **Property 12: Validation Title Task**
    - **Validates: Yêu cầu 8.2**

  - [ ]* 6.3 Viết property test cho Property 13: Validation enum fields (status và priority)
    - **Property 13: Validation Enum Fields (Status và Priority)**
    - **Validates: Yêu cầu 8.3, 8.4**

- [ ] 7. Xây dựng các component dùng chung (Common Components)
  - [ ] 7.1 Tạo `src/components/common/AppNavBar.vue` với logo, tên người dùng, nút đăng xuất và hamburger menu cho mobile
    - Sử dụng Element Plus `el-menu` hoặc `el-header`; responsive ẩn/hiện hamburger khi < 768px
    - _Yêu cầu: 9.2, 9.4_

  - [ ] 7.2 Tạo `src/components/common/LoadingSpinner.vue` và `src/components/common/SkeletonCard.vue`
    - LoadingSpinner: Element Plus `el-loading` hoặc custom spinner
    - SkeletonCard: Element Plus `el-skeleton` cho project card
    - _Yêu cầu: 6.9, 7.8, 11.1_

  - [ ] 7.3 Cập nhật `src/App.vue` để tích hợp AppNavBar, router-view và xử lý global layout
    - _Yêu cầu: 9.1, 9.7_

- [ ] 8. Xây dựng trang Authentication (Login và Register)
  - [ ] 8.1 Tạo `src/views/auth/LoginView.vue` với form đăng nhập sử dụng VeeValidate, gọi `AuthStore.login()`, hiển thị lỗi inline
    - Sử dụng Element Plus `el-form`, `el-input`, `el-button`
    - _Yêu cầu: 2.1, 2.3, 2.4_

  - [ ] 8.2 Tạo `src/views/auth/RegisterView.vue` với form đăng ký (username, email, password), gọi `AuthStore.register()`, tự động đăng nhập sau khi đăng ký thành công
    - _Yêu cầu: 2.2, 2.5_

  - [ ]* 8.3 Viết unit test cho LoginView và RegisterView
    - Kiểm tra form validation, gọi đúng store action, redirect sau khi thành công
    - _Yêu cầu: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 9. Xây dựng trang Dashboard và Project Components
  - [ ] 9.1 Tạo `src/components/project/ProjectCard.vue` hiển thị tên, mô tả, số lượng task, ngày tạo; emit event khi click
    - _Yêu cầu: 6.3, 6.4_

  - [ ] 9.2 Tạo `src/components/project/ProjectForm.vue` với form tạo/chỉnh sửa dự án trong Element Plus dialog, validation tên dự án bắt buộc
    - _Yêu cầu: 6.5, 6.6_

  - [ ] 9.3 Tạo `src/views/DashboardView.vue` — fetch projects trong `onMounted`, hiển thị ProjectCard list, SkeletonCard khi loading, nút tạo dự án mới, xác nhận xóa dự án
    - Sử dụng `<script setup>`, `onMounted`, `computed`, `watch`
    - _Yêu cầu: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.4 Viết unit test cho DashboardView
    - Kiểm tra hiển thị skeleton khi loading, render ProjectCard, mở dialog tạo dự án
    - _Yêu cầu: 6.1, 6.9_

- [ ] 10. Xây dựng Kanban Board và Task Components
  - [ ] 10.1 Tạo `src/components/task/TaskCard.vue` hiển thị tiêu đề, trạng thái, độ ưu tiên, người được giao; hỗ trợ drag & drop với vue-draggable-plus
    - _Yêu cầu: 7.3, 7.4_

  - [ ] 10.2 Tạo `src/components/task/KanbanColumn.vue` — một cột Kanban với tiêu đề cột và danh sách TaskCard có thể kéo thả
    - _Yêu cầu: 7.3, 7.4_

  - [ ] 10.3 Tạo `src/components/task/KanbanBoard.vue` — 3 cột (todo, in_progress, done), xử lý sự kiện drag & drop emit `task-moved`, hiển thị loading spinner khi `isLoading`; responsive hiển thị dọc khi < 768px
    - Props: `tasks (Task[])`, `isLoading (boolean)`; Emits: `task-moved (taskId, newStatus)`
    - _Yêu cầu: 7.1, 7.3, 7.4, 7.8, 9.3_

  - [ ] 10.4 Tạo `src/components/task/TaskTable.vue` — hiển thị tasks trong `el-table` với các cột: tiêu đề, trạng thái, độ ưu tiên, người được giao, ngày tạo; hỗ trợ filter theo status và priority
    - _Yêu cầu: 7.6, 7.7_

  - [ ]* 10.5 Viết property test cho Property 11: Task Filter trả về đúng subset
    - **Property 11: Task Filter Trả Về Đúng Subset**
    - **Validates: Yêu cầu 7.7**

  - [ ]* 10.6 Viết unit test cho KanbanBoard component
    - Kiểm tra render đúng 3 cột, emit `task-moved` khi kéo thả, hiển thị spinner khi loading
    - _Yêu cầu: 7.3, 7.4, 7.8_

- [ ] 11. Xây dựng TaskForm và tích hợp CRUD Task
  - [ ] 11.1 Tạo `src/components/task/TaskForm.vue` với VeeValidate + Yup schema, các trường: title, description, status, priority, assignee; hiển thị lỗi validation inline bên dưới từng trường
    - Props: `task (Task | null)`, `projectId (string)`, `mode ('create' | 'edit')`; Emits: `submit (taskData)`, `cancel`
    - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 11.2 Viết unit test cho TaskForm component
    - Kiểm tra validation lỗi hiển thị đúng, submit với dữ liệu hợp lệ, cancel emit
    - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Xây dựng trang Project Detail
  - [ ] 12.1 Tạo `src/views/ProjectDetailView.vue` — fetch tasks trong `onMounted`, tích hợp KanbanBoard và TaskTable, nút chuyển đổi view, xử lý drag & drop gọi `TaskStore.patchTask`, dialog TaskForm cho tạo/chỉnh sửa task, xác nhận xóa task, toast thông báo thành công/thất bại
    - Sử dụng `watch` để theo dõi route params và fetch lại dữ liệu khi project thay đổi
    - Sử dụng `provide/inject` nếu cần chia sẻ projectId với deeply nested components
    - _Yêu cầu: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 8.6, 8.7, 8.8, 8.9, 10.1, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 12.2 Viết unit test cho ProjectDetailView
    - Kiểm tra fetch tasks khi mount, chuyển đổi view Kanban/Table, hiển thị loading
    - _Yêu cầu: 7.1, 7.2, 7.5, 7.8_

- [ ] 13. Xây dựng trang lỗi và hoàn thiện routing
  - [ ] 13.1 Tạo `src/views/NotFoundView.vue` với thông báo lỗi 404 và link quay về Dashboard
    - _Yêu cầu: 11.4, 11.6, 11.7_

  - [ ] 13.2 Tạo `src/composables/useAuth.js`, `src/composables/useProjects.js`, `src/composables/useTasks.js` để đóng gói logic tái sử dụng từ stores
    - _Yêu cầu: 10.1_

- [ ] 14. Checkpoint cuối — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi Chú

- Các task đánh dấu `*` là tùy chọn và có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến yêu cầu cụ thể để đảm bảo traceability
- Các checkpoint đảm bảo kiểm tra tăng dần sau mỗi nhóm tính năng
- Property tests sử dụng fast-check với tối thiểu 100 iterations mỗi test
- Unit tests sử dụng Vitest + Vue Test Utils với mock ApiClient
- Ngôn ngữ triển khai: JavaScript (Vue 3 Composition API với `<script setup>`)
