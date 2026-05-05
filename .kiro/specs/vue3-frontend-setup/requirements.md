# Tài Liệu Yêu Cầu

## Giới Thiệu

Tính năng này xây dựng toàn bộ frontend cho ứng dụng quản lý dự án (Project Management App) sử dụng Vue 3 + Vite. Ứng dụng cho phép người dùng đăng nhập, quản lý dự án và công việc (task) thông qua giao diện Kanban board hoặc table view, tích hợp với Django REST API backend thông qua JWT authentication. Project hiện tại đã có cấu trúc cơ bản với Vue 3, Vite, Vue Router 4 và Pinia được khởi tạo sẵn.

## Bảng Thuật Ngữ

- **App**: Ứng dụng frontend Vue 3 quản lý dự án
- **Router**: Vue Router 4 — hệ thống điều hướng trang
- **Store**: Pinia store — nơi quản lý trạng thái toàn cục
- **AuthStore**: Pinia store quản lý trạng thái xác thực người dùng
- **ProjectStore**: Pinia store quản lý danh sách và chi tiết dự án
- **TaskStore**: Pinia store quản lý danh sách và chi tiết công việc
- **ApiClient**: Instance Axios được cấu hình sẵn để gọi Django REST API
- **AuthGuard**: Navigation guard kiểm tra trạng thái đăng nhập trước khi truy cập route
- **JWT**: JSON Web Token — cơ chế xác thực stateless
- **AccessToken**: JWT token ngắn hạn dùng để xác thực mỗi request
- **RefreshToken**: JWT token dài hạn dùng để làm mới AccessToken
- **Validator**: Module xác thực dữ liệu form sử dụng VeeValidate + Yup
- **KanbanBoard**: Component hiển thị công việc theo cột trạng thái (To Do, In Progress, Done)
- **TaskForm**: Component form tạo/chỉnh sửa công việc
- **UILibrary**: Thư viện UI component (Element Plus hoặc Vuetify 3 hoặc PrimeVue)
- **Project**: Đối tượng dự án gồm id, name, description, created_at, updated_at
- **Task**: Đối tượng công việc gồm id, title, description, status, priority, assignee, project_id
- **User**: Đối tượng người dùng gồm id, username, email

---

## Yêu Cầu

### Yêu Cầu 1: Cấu Hình Dự Án và Cài Đặt Dependencies

**User Story:** Là một developer, tôi muốn project được cấu hình đầy đủ với tất cả dependencies cần thiết, để tôi có thể bắt đầu phát triển tính năng ngay lập tức mà không cần cấu hình thêm.

#### Tiêu Chí Chấp Nhận

1. THE App SHALL cài đặt và cấu hình UILibrary (Element Plus hoặc Vuetify 3 hoặc PrimeVue) như một plugin Vue toàn cục trong `src/main.js`
2. THE App SHALL cài đặt và cấu hình Axios làm HTTP client với base URL trỏ đến Django REST API
3. THE App SHALL cài đặt và cấu hình VeeValidate cùng Yup để xác thực form
4. THE App SHALL cài đặt và cấu hình `pinia-plugin-persistedstate` để lưu trữ state vào localStorage
5. THE App SHALL cấu hình alias `@` trỏ đến thư mục `src/` trong `vite.config.js` (đã có sẵn)
6. WHEN môi trường là development, THE App SHALL bật Vue DevTools thông qua `vite-plugin-vue-devtools` (đã có sẵn)

---

### Yêu Cầu 2: Hệ Thống Xác Thực (Authentication)

**User Story:** Là một người dùng, tôi muốn đăng nhập và đăng ký tài khoản, để tôi có thể truy cập và quản lý dự án của mình một cách bảo mật.

#### Tiêu Chí Chấp Nhận

1. THE App SHALL cung cấp trang đăng nhập tại route `/login` với form nhập username và password
2. THE App SHALL cung cấp trang đăng ký tại route `/register` với form nhập username, email và password
3. WHEN người dùng gửi form đăng nhập hợp lệ, THE AuthStore SHALL gọi API `POST /api/auth/token/` và lưu AccessToken và RefreshToken vào localStorage
4. WHEN đăng nhập thành công, THE Router SHALL điều hướng người dùng đến trang Dashboard (`/dashboard`)
5. WHEN người dùng gửi form đăng ký hợp lệ, THE AuthStore SHALL gọi API `POST /api/auth/register/` và tự động đăng nhập người dùng
6. WHEN AccessToken hết hạn, THE ApiClient SHALL tự động gọi API `POST /api/auth/token/refresh/` với RefreshToken để lấy AccessToken mới
7. IF RefreshToken hết hạn hoặc không hợp lệ, THEN THE AuthStore SHALL xóa tất cả token khỏi localStorage và điều hướng người dùng đến trang `/login`
8. WHEN người dùng nhấn nút đăng xuất, THE AuthStore SHALL xóa AccessToken và RefreshToken khỏi localStorage và điều hướng đến `/login`
9. THE AuthStore SHALL lưu trữ trạng thái `isAuthenticated` và thông tin `user` vào localStorage thông qua `pinia-plugin-persistedstate`

---

### Yêu Cầu 3: Cấu Hình Vue Router và Navigation Guards

**User Story:** Là một người dùng, tôi muốn hệ thống điều hướng bảo vệ các trang yêu cầu đăng nhập, để tôi không thể truy cập trang quản lý dự án khi chưa xác thực.

#### Tiêu Chí Chấp Nhận

1. THE Router SHALL định nghĩa các route: `/login`, `/register`, `/dashboard`, `/projects/:id`, `/projects/:id/tasks/:taskId`
2. THE Router SHALL hỗ trợ nested routes với `/projects/:id` là parent route chứa các child routes cho các view khác nhau
3. WHEN người dùng truy cập route có `meta.requiresAuth: true`, THE AuthGuard SHALL kiểm tra `isAuthenticated` trong AuthStore
4. IF người dùng chưa đăng nhập và truy cập route yêu cầu xác thực, THEN THE AuthGuard SHALL điều hướng đến `/login`
5. IF người dùng đã đăng nhập và truy cập `/login` hoặc `/register`, THEN THE Router SHALL điều hướng đến `/dashboard`
6. THE Router SHALL sử dụng lazy loading (`() => import(...)`) cho tất cả các view component ngoại trừ trang đăng nhập
7. WHEN route thay đổi, THE App SHALL cập nhật `document.title` theo giá trị `meta.title` của route hiện tại

---

### Yêu Cầu 4: Cấu Hình ApiClient và Interceptors

**User Story:** Là một developer, tôi muốn có một ApiClient được cấu hình sẵn với JWT authentication, để mọi request đến Django REST API đều được xác thực tự động mà không cần xử lý thủ công ở từng component.

#### Tiêu Chí Chấp Nhận

1. THE ApiClient SHALL được khởi tạo với `baseURL` lấy từ biến môi trường `VITE_API_BASE_URL`
2. THE ApiClient SHALL đặt header `Content-Type: application/json` mặc định cho tất cả request
3. WHEN gửi request, THE ApiClient SHALL tự động đính kèm AccessToken vào header `Authorization: Bearer <token>` nếu token tồn tại trong localStorage
4. WHEN nhận response có HTTP status 401, THE ApiClient SHALL thực hiện token refresh trước khi retry request gốc
5. IF token refresh thất bại, THEN THE ApiClient SHALL dispatch logout action và trả về lỗi cho caller
6. WHEN nhận response có HTTP status 400, 403, 404, hoặc 500, THE ApiClient SHALL trả về error object có cấu trúc `{ status, message, errors }` cho caller xử lý
7. THE ApiClient SHALL timeout sau 30 giây nếu server không phản hồi

---

### Yêu Cầu 5: Pinia Store Quản Lý Trạng Thái

**User Story:** Là một developer, tôi muốn có các Pinia store được tổ chức rõ ràng cho từng domain, để trạng thái ứng dụng được quản lý nhất quán và dễ debug.

#### Tiêu Chí Chấp Nhận

1. THE AuthStore SHALL quản lý state: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, `error`
2. THE ProjectStore SHALL quản lý state: `projects` (danh sách), `currentProject`, `isLoading`, `error`, `pagination`
3. THE TaskStore SHALL quản lý state: `tasks` (danh sách theo project), `currentTask`, `isLoading`, `error`
4. THE AuthStore SHALL được persist toàn bộ vào localStorage thông qua `pinia-plugin-persistedstate`
5. WHERE cần thiết, THE ProjectStore SHALL persist `currentProject` vào sessionStorage để giữ context khi reload trang
6. WHEN action trong store gọi API thất bại, THE Store SHALL cập nhật state `error` với thông báo lỗi và đặt `isLoading` về `false`
7. THE ProjectStore SHALL cung cấp getter `projectById(id)` trả về Project tương ứng từ danh sách `projects`
8. THE TaskStore SHALL cung cấp getter `tasksByStatus(status)` trả về danh sách Task được lọc theo trạng thái

---

### Yêu Cầu 6: Trang Dashboard và Quản Lý Dự Án

**User Story:** Là một người dùng đã đăng nhập, tôi muốn xem danh sách tất cả dự án của mình trên Dashboard, để tôi có thể nhanh chóng truy cập và quản lý từng dự án.

#### Tiêu Chí Chấp Nhận

1. WHEN người dùng truy cập `/dashboard`, THE App SHALL hiển thị danh sách tất cả Project của người dùng hiện tại
2. WHEN trang Dashboard được mount, THE ProjectStore SHALL gọi API `GET /api/projects/` và cập nhật state `projects`
3. THE App SHALL hiển thị mỗi Project dưới dạng card với thông tin: tên, mô tả, số lượng task, ngày tạo
4. WHEN người dùng nhấn vào một Project card, THE Router SHALL điều hướng đến `/projects/:id`
5. THE App SHALL cung cấp nút "Tạo dự án mới" mở dialog/modal với form nhập tên và mô tả dự án
6. WHEN người dùng gửi form tạo dự án hợp lệ, THE ProjectStore SHALL gọi API `POST /api/projects/` và thêm Project mới vào danh sách
7. THE App SHALL cung cấp chức năng xóa dự án với dialog xác nhận trước khi thực hiện
8. WHEN xóa dự án thành công, THE ProjectStore SHALL gọi API `DELETE /api/projects/:id/` và xóa Project khỏi state `projects`
9. WHILE `ProjectStore.isLoading` là `true`, THE App SHALL hiển thị skeleton loading component thay cho danh sách dự án

---

### Yêu Cầu 7: Trang Chi Tiết Dự Án và Kanban Board

**User Story:** Là một người dùng, tôi muốn xem và quản lý các công việc trong dự án thông qua Kanban board, để tôi có thể theo dõi tiến độ công việc một cách trực quan.

#### Tiêu Chí Chấp Nhận

1. WHEN người dùng truy cập `/projects/:id`, THE App SHALL hiển thị thông tin chi tiết Project và danh sách Task dưới dạng KanbanBoard
2. WHEN trang Project Detail được mount, THE TaskStore SHALL gọi API `GET /api/projects/:id/tasks/` và cập nhật state `tasks`
3. THE KanbanBoard SHALL hiển thị Task theo 3 cột: "Chờ xử lý" (todo), "Đang thực hiện" (in_progress), "Hoàn thành" (done)
4. WHEN người dùng kéo thả (drag & drop) một Task sang cột khác, THE TaskStore SHALL gọi API `PATCH /api/tasks/:id/` để cập nhật trường `status`
5. THE App SHALL cung cấp nút chuyển đổi giữa Kanban view và Table view cho danh sách Task
6. WHEN ở Table view, THE App SHALL hiển thị Task trong bảng với các cột: tiêu đề, trạng thái, độ ưu tiên, người được giao, ngày tạo
7. THE App SHALL hỗ trợ lọc Task theo `status` và `priority` thông qua dropdown filter
8. WHILE `TaskStore.isLoading` là `true`, THE App SHALL hiển thị loading spinner trong KanbanBoard

---

### Yêu Cầu 8: Tạo, Chỉnh Sửa và Xóa Task

**User Story:** Là một người dùng, tôi muốn tạo, chỉnh sửa và xóa công việc với form có validation, để dữ liệu công việc luôn hợp lệ và nhất quán.

#### Tiêu Chí Chấp Nhận

1. THE App SHALL cung cấp TaskForm component với các trường: title (bắt buộc), description (tùy chọn), status (bắt buộc), priority (bắt buộc), assignee (tùy chọn)
2. THE Validator SHALL xác thực trường `title` không được để trống và không vượt quá 200 ký tự
3. THE Validator SHALL xác thực trường `status` phải là một trong các giá trị: `todo`, `in_progress`, `done`
4. THE Validator SHALL xác thực trường `priority` phải là một trong các giá trị: `low`, `medium`, `high`
5. IF người dùng gửi TaskForm với dữ liệu không hợp lệ, THEN THE Validator SHALL hiển thị thông báo lỗi cụ thể bên dưới trường tương ứng
6. WHEN người dùng gửi TaskForm hợp lệ để tạo mới, THE TaskStore SHALL gọi API `POST /api/projects/:id/tasks/` và thêm Task vào state
7. WHEN người dùng gửi TaskForm hợp lệ để chỉnh sửa, THE TaskStore SHALL gọi API `PUT /api/tasks/:id/` và cập nhật Task trong state
8. WHEN người dùng xác nhận xóa Task, THE TaskStore SHALL gọi API `DELETE /api/tasks/:id/` và xóa Task khỏi state
9. WHEN thao tác tạo/chỉnh sửa/xóa Task thành công, THE App SHALL hiển thị thông báo toast thành công và đóng dialog/modal

---

### Yêu Cầu 9: Giao Diện Responsive và UILibrary

**User Story:** Là một người dùng, tôi muốn giao diện ứng dụng hiển thị đúng trên cả desktop và mobile, để tôi có thể sử dụng ứng dụng trên nhiều thiết bị khác nhau.

#### Tiêu Chí Chấp Nhận

1. THE App SHALL sử dụng hệ thống grid layout của UILibrary để xây dựng layout responsive
2. WHEN màn hình có chiều rộng nhỏ hơn 768px, THE App SHALL ẩn sidebar navigation và hiển thị hamburger menu thay thế
3. WHEN màn hình có chiều rộng nhỏ hơn 768px, THE KanbanBoard SHALL hiển thị từng cột theo chiều dọc thay vì chiều ngang
4. THE App SHALL sử dụng component navigation bar của UILibrary với logo, tên người dùng và nút đăng xuất
5. THE App SHALL sử dụng component dialog/modal của UILibrary cho TaskForm và form tạo dự án
6. THE App SHALL sử dụng component toast/notification của UILibrary để hiển thị thông báo thành công và lỗi
7. THE App SHALL áp dụng theme màu nhất quán thông qua CSS variables hoặc cơ chế theming của UILibrary

---

### Yêu Cầu 10: Quản Lý Lifecycle và Reactivity

**User Story:** Là một developer, tôi muốn các component sử dụng đúng Vue 3 Composition API và lifecycle hooks, để ứng dụng hoạt động hiệu quả và không có memory leak.

#### Tiêu Chí Chấp Nhận

1. THE App SHALL sử dụng `<script setup>` syntax cho tất cả component mới
2. THE App SHALL sử dụng `ref()` cho các giá trị primitive và `reactive()` cho các object phức tạp trong component
3. THE App SHALL sử dụng `computed()` cho các giá trị dẫn xuất thay vì tính toán trực tiếp trong template
4. WHEN component cần fetch dữ liệu khi khởi tạo, THE App SHALL thực hiện trong `onMounted()` lifecycle hook
5. WHEN component bị unmount, THE App SHALL hủy tất cả event listener và watcher đã đăng ký để tránh memory leak
6. THE App SHALL sử dụng `watch()` hoặc `watchEffect()` để phản ứng với thay đổi của route params và tự động fetch dữ liệu mới
7. THE App SHALL sử dụng `provide/inject` để chia sẻ dữ liệu giữa parent component và deeply nested child components khi cần thiết

---

### Yêu Cầu 11: Xử Lý Lỗi và Loading States

**User Story:** Là một người dùng, tôi muốn nhận được phản hồi rõ ràng khi có lỗi xảy ra hoặc khi ứng dụng đang tải dữ liệu, để tôi biết trạng thái hiện tại của ứng dụng.

#### Tiêu Chí Chấp Nhận

1. WHILE bất kỳ API call nào đang thực thi, THE App SHALL hiển thị loading indicator phù hợp (spinner hoặc skeleton)
2. IF API call thất bại với lỗi network, THEN THE App SHALL hiển thị thông báo "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
3. IF API call thất bại với HTTP status 403, THEN THE App SHALL hiển thị thông báo "Bạn không có quyền thực hiện thao tác này."
4. IF API call thất bại với HTTP status 404, THEN THE App SHALL hiển thị trang lỗi 404 với nút quay về Dashboard
5. IF API call thất bại với HTTP status 500, THEN THE App SHALL hiển thị thông báo "Đã xảy ra lỗi server. Vui lòng thử lại sau."
6. THE App SHALL cung cấp route `/404` với component NotFound hiển thị thông báo lỗi và link quay về Dashboard
7. WHEN người dùng truy cập route không tồn tại, THE Router SHALL điều hướng đến route `/404`
