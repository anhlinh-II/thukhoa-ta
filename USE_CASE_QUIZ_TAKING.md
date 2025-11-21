# Use Case Diagram - Tính năng Làm Bài Thi

## Diagram PlantUML

```plantuml
@startuml QuizTaking
skinparam linetype ortho
skinparam classBackgroundColor #E1F5FF
skinparam actorBackgroundColor #FFE4B5

actor "Người dùng (User)" as User
participant "Hệ thống làm bài" as System

rectangle "Tính năng Làm Bài Thi" {
    usecase "UC1: Xem danh sách Quiz\ntrong nhóm" as UC1
    usecase "UC2: Chọn bài thi\nđể bắt đầu" as UC2
    usecase "UC3: Tải dữ liệu bài thi\n(câu hỏi, đáp án)" as UC3
    usecase "UC4: Xem câu hỏi\ntrong nhóm" as UC4
    usecase "UC5: Chọn đáp án\ncho câu hỏi" as UC5
    usecase "UC6: Đánh dấu câu\nchưa chắc chắn" as UC6
    usecase "UC7: Highlight/Ghi chú\nnội dung" as UC7
    usecase "UC8: Xem lượt hẹn\nôn tập (Review)" as UC8
    usecase "UC9: Trả lời câu\nôn tập" as UC9
    usecase "UC10: Xem Bộ đếm\nthời gian" as UC10
    usecase "UC11: Nộp bài\n(Submit)" as UC11
    usecase "UC12: Lưu kết quả\nôn tập" as UC12
    usecase "UC13: Xem kết quả\nbài thi" as UC13
    usecase "UC14: Thoát/Quay lại" as UC14
}

User --> UC1 : Vào nhóm quiz
User --> UC2 : Chọn quiz
UC2 --> UC3 : Trigger
UC3 --> UC4 : Hiển thị

User --> UC4 : Xem câu hỏi
User --> UC5 : Trả lời
User --> UC6 : Đánh dấu
User --> UC7 : Highlight
User --> UC8 : [Review mode] Xem ôn tập
User --> UC9 : Trả lời ôn tập
User --> UC10 : Theo dõi
User --> UC11 : Nộp bài

UC11 --> UC12 : Persist data
UC12 --> UC13 : Redirect

User --> UC14 : Thoát

UC13 --> UC14 : Kết thúc
```

## Chi tiết các Use Case

### **UC1: Xem danh sách Quiz trong nhóm**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đã đăng nhập, chọn được nhóm quiz
- **Flow chính**:
  1. Người dùng vào trang `/quiz-groups/[id]/quizzes`
  2. Hệ thống hiển thị danh sách các quiz trong nhóm
  3. Mỗi quiz hiển thị: tên, mô tả, số câu hỏi
- **Flow thay thế**: Không có quiz → hiển thị thông báo trống
- **File liên quan**: `src/app/(public)/quiz-groups/[id]/quizzes/page.tsx`

---

### **UC2: Chọn bài thi để bắt đầu**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đang xem danh sách quiz
- **Flow chính**:
  1. Người dùng click vào một quiz
  2. Hệ thống navigate đến `/quiz/[id]/start` (hoặc `/quiz-taking/[id]`)
  3. Bắt đầu quá trình tải dữ liệu bài thi
- **File liên quan**: `quiz-groups/[id]/quizzes/page.tsx`, `quiz-taking/[id]/page.tsx`

---

### **UC3: Tải dữ liệu bài thi (câu hỏi, đáp án)**
- **Actor**: Hệ thống (tự động)
- **Điều kiện tiên quyết**: Đã chọn quiz
- **Flow chính**:
  1. Gọi API: `GET /api/v1/quiz-mock-tests/{quizId}/preview`
  2. Backend trả về cấu trúc:
     ```json
     {
       "questionGroups": [{
         "id": 1,
         "title": "Nhóm 1",
         "contentHtml": "...",
         "questions": [{ "id": 1, "contentHtml": "...", "options": [...] }]
       }],
       "standaloneQuestions": [{...}]
     }
     ```
  3. Frontend render câu hỏi theo cấu trúc
- **Flow thay thế**: API lỗi → hiển thị lỗi, cho phép thoát
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 74-88)

---

### **UC4: Xem câu hỏi trong nhóm**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đã tải xong dữ liệu bài thi
- **Flow chính**:
  1. Hiển thị **Question Groups** theo thứ tự
  2. Mỗi group hiển thị:
     - Tiêu đề nhóm (H2)
     - Nội dung nhóm (nếu có)
     - Danh sách câu hỏi (H3)
  3. Sau groups là **Standalone Questions** (không thuộc group)
  4. Người dùng scroll để xem tất cả câu
- **UI Details**:
  - Mỗi câu có: số thứ tự, nội dung HTML, 4 đáp án (ABCD)
  - Right sidebar: bộ đếm thời gian, số câu đã làm/tổng số
  - Grid điều hướng câu hỏi (5 cột)
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 503-577)

---

### **UC5: Chọn đáp án cho câu hỏi**
- **Actor**: Người dùng
- **Flow chính**:
  1. Người dùng click vào một Radio button (đáp án A/B/C/D)
  2. Hệ thống ghi nhận lựa chọn vào `answers` state: `{ questionId: optionId }`
  3. Nút grid câu hỏi tương ứng chuyển từ xám → xanh
  4. Bộ đếm "câu đã hoàn thành" cập nhật
- **State management**: 
  ```typescript
  const [answers, setAnswers] = useState<Record<number, number>>({});
  ```
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 257-262)

---

### **UC6: Đánh dấu câu chưa chắc chắn**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đang xem câu hỏi
- **Flow chính**:
  1. Người dùng click vào icon **Cờ (Flag)** trên câu hỏi
  2. Hệ thống toggle `marks[questionId]` trong state
  3. Icon flag chuyển từ xám → đỏ
  4. Nút grid câu hỏi hiển thị badge đỏ "!"
- **State management**:
  ```typescript
  const [marks, setMarks] = useState<Record<number, boolean>>({});
  ```
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 245-246, 528-535)

---

### **UC7: Highlight/Ghi chú nội dung**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đang xem câu hỏi
- **Flow chính**:
  1. Người dùng click vào **nút Switch "Chế độ Highlight"**
  2. Toggle `highlightMode` state
  3. Nếu bật:
     - Select text từ nội dung câu hỏi
     - Click icon highlight (vàng/xanh/đỏ/xanh nhạt)
     - Highlight text được thêm vào DOM
  4. Double-click highlight để xóa
  5. Nút "Xóa tất cả highlights" để clear hết
- **Options**:
  - Highlight vàng (underline), xanh (bold), đỏ (strikethrough)
  - Ghi chú bằng TextArea (lưu ở localStorage)
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 468-476, 640-683)

---

### **UC8: Xem lượt hẹn ôn tập (Review)**
- **Actor**: Người dùng (chế độ ôn tập/review)
- **Điều kiện tiên quyết**: Truy cập trang `/review` thay vì trang làm bài thi
- **Flow chính**:
  1. Gọi API: `userLearningItemService.due('MOCKTEST')`
  2. Backend trả về danh sách câu hỏi cần ôn tập
  3. Hiển thị câu hỏi một lần một
  4. Người dùng trả lời và bấm "Tiếp tục"
- **File liên quan**: `src/app/(public)/review/page.tsx`

---

### **UC9: Trả lời câu ôn tập**
- **Actor**: Người dùng
- **Flow chính**:
  1. Người dùng chọn đáp án cho câu hỏi ôn tập
  2. Click "Tiếp tục"
  3. Hệ thống tính **chất lượng (quality)**:
     - Đúng + < 4s → 5
     - Đúng + 4-10s → 4
     - Đúng + > 10s → 3
     - Sai + < 4s → 2
     - Sai + > 4s → 1
  4. Gửi feedback đến backend: `userLearningItemService.review(itemId, quality)`
  5. Load câu tiếp theo
- **File liên quan**: `review/page.tsx` (lines 56-93)

---

### **UC10: Xem Bộ đếm thời gian**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đang làm bài thi
- **Flow chính**:
  1. Sidebar phải hiển thị countdown timer (HH:MM:SS)
  2. Timer khởi tạo với giá trị: `configDuration * 60` giây
  3. Mỗi giây giảm 1
  4. Khi < 5 phút: timer chuyển màu đỏ
  5. Khi = 0: tự động nộp bài
- **State management**:
  ```typescript
  const [timeLeft, setTimeLeft] = useState(configDuration * 60);
  ```
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 108-119, 636-645)

---

### **UC11: Nộp bài (Submit)**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đã trả lời ít nhất 1 câu
- **Flow chính**:
  1. Người dùng click nút **"NỘP BÀI"**
  2. Modal xác nhận hiển thị: "Bạn đã làm X/Y câu. Chắc chắn nộp?"
  3. Người dùng confirm → Modal đóng
  4. Gọi API: `quizMockTestService.submit(quizId, answers, timeSpentMinutes)`
  5. Backend xử lý:
     - Tính điểm
     - Lưu user_quiz_history
     - Lưu user_question_answer (per-question)
     - Trả về kết quả
  6. Frontend lưu kết quả vào sessionStorage
  7. Persist per-question answers nếu backend chưa làm
- **Response**:
  ```json
  {
    "quizHisId": 123,
    "score": 85,
    "answers": [{ "questionId": 1, "yourOptionId": 2, "isCorrect": true }],
    "...": "..."
  }
  ```
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 273-333)

---

### **UC12: Lưu kết quả ôn tập**
- **Actor**: Hệ thống (tự động)
- **Điều kiện tiên quyết**: Gọi UC11 (submit) hoặc UC9 (review)
- **Flow chính**:
  1. **Nếu là bài thi thường**:
     - Tạo `user_quiz_history` record
     - Tạo `user_question_answer` records (1 cho mỗi câu)
     - Transaction rollback nếu lỗi
  2. **Nếu là ôn tập**:
     - Cập nhật `user_learning_item.nextReview` dựa trên quality
     - Tính toán spaced repetition schedule
- **File liên quan**: Backend `QuizMockTestService.submit()`, `UserQuestionAnswerService`, `QuizSubmissionPersistenceService`

---

### **UC13: Xem kết quả bài thi**
- **Actor**: Người dùng
- **Điều kiện tiên quyết**: Đã nộp bài (UC11)
- **Flow chính**:
  1. Frontend navigate đến `/quiz-results/[quizId]`
  2. Tải kết quả từ sessionStorage hoặc API
  3. Hiển thị:
     - Điểm tổng / điểm tối đa
     - Số câu đúng/sai
     - Độ chính xác (%)
     - Thời gian hoàn thành
     - Danh sách câu hỏi với kết quả (đúng/sai)
  4. Nút "Xem chi tiết" → trang review chi tiết câu hỏi
- **File liên quan**: `src/app/(public)/quiz-results/[id]/page.tsx`

---

### **UC14: Thoát/Quay lại**
- **Actor**: Người dùng
- **Flow chính**:
  1. Người dùng click nút **"Thoát"** trong quá trình làm bài
  2. Hệ thống confirm: "Kết thúc làm bài? Dữ liệu chưa nộp sẽ bị mất."
  3. Nếu confirm → navigate quay lại trang danh sách quiz hoặc home
  4. Nếu không → quay lại trang làm bài (không thay đổi gì)
- **Alternative**: Nếu timeout → tự động nộp bài
- **File liên quan**: `quiz-taking/[id]/page.tsx` (lines 468-476)

---

## Use Cases trong trang Admin

### **UC-Admin-1: Tạo bài thi mới**
- **Actor**: Admin
- **Flow**: Admin → Quiz Management → Create Quiz → Nhập tên, mô tả, thời gian, chọn nhóm → Save
- **Output**: Quiz được tạo, chuyển sang UC-Admin-2 (Quản lý câu hỏi)

### **UC-Admin-2: Quản lý câu hỏi của bài thi**
- **Actor**: Admin
- **Flow**: Chọn quiz → Xem danh sách câu hỏi → CRUD câu hỏi
  - Add: Nhập nội dung, chọn loại (single/multiple), thêm đáp án, chọn đáp án đúng
  - Edit: Sửa câu hỏi, đáp án
  - Delete: Xóa câu hỏi
  - Reorder: Thay đổi thứ tự câu hỏi

### **UC-Admin-3: Tạo nhóm câu hỏi (Question Group)**
- **Actor**: Admin
- **Flow**: Quiz Management → Tạo nhóm → Nhập tên, mô tả → Gán câu hỏi vào nhóm → Save
- **Output**: Nhóm câu hỏi được tạo, câu hỏi được sắp xếp theo nhóm

### **UC-Admin-4: Import quiz từ Word**
- **Actor**: Admin
- **Flow**: 
  1. Upload file Word (.docx)
  2. Hệ thống parse Word → hiển thị Markup (chỉnh sửa loại element)
  3. Preview Excel (3 sheet)
  4. Nhập metadata (tên quiz, duration, nhóm)
  5. Confirm import → Batch create quiz + groups + questions + options
- **Output**: Quiz, Groups, Questions được tạo từ file Word

### **UC-Admin-5: Xem thống kê kết quả bài thi**
- **Actor**: Admin
- **Flow**: Dashboard → Chọn quiz → Xem:
  - Số người làm bài
  - Điểm trung bình
  - Độ chính xác trung bình
  - Phân bố điểm (histogram)
  - Danh sách người làm bài + kết quả của họ

### **UC-Admin-6: Quản lý nhóm quiz (Quiz Groups)**
- **Actor**: Admin
- **Flow**: Quiz Groups → CRUD nhóm
  - Create: Nhập tên, mô tả nhóm
  - Read: Xem danh sách quiz trong nhóm
  - Update: Sửa tên, mô tả
  - Delete: Xóa nhóm (nếu không có quiz)

### **UC-Admin-7: Quản lý quyền hạn (Role & Permissions)**
- **Actor**: Admin
- **Flow**: Role Permissions → CRUD role
  - Create role mới
  - Gán permissions cho role (View, Create, Edit, Delete)
  - Assign users vào role
  - Xem danh sách user theo role

### **UC-Admin-8: Quản lý users**
- **Actor**: Admin
- **Flow**: Users → CRUD user
  - Create: Thêm user mới (email, name, role)
  - Edit: Sửa thông tin, role
  - Delete: Xóa user
  - View: Xem danh sách user, lịch sử làm bài

### **UC-Admin-9: Xem lịch sử làm bài của user**
- **Actor**: Admin
- **Flow**: Users → Chọn user → Xem lịch sử
  - Danh sách bài thi đã làm
  - Điểm từng bài
  - Thời gian làm bài
  - Chi tiết câu trả lời (câu nào đúng/sai)

### **UC-Admin-10: Xuất báo cáo (Export Report)**
- **Actor**: Admin
- **Flow**: Dashboard → Export → Chọn format (Excel/PDF) → Chọn quiz/user → Download
  - Report: Thống kê chung, danh sách kết quả chi tiết

---

## Mối quan hệ giữa các Use Case

```
┌─────────────────────────────────────────────────────────────┐
│         Làm Bài Thi (MOCK_TEST)                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  UC1 → UC2 → UC3 ↓                                           │
│                ├─→ UC4 (Loop) → UC5, UC6, UC7, UC10         │
│                └─→ UC11 ↓                                    │
│                     UC12 → UC13 ↓                            │
│                              UC14                            │
│                                                               │
│         Ôn Tập (REVIEW)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  UC8 (Load items) → Loop: UC4, UC9, UC10 → UC12 → UC8      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Danh sách Actors

| Actor | Vai trò | Tương tác |
|-------|--------|----------|
| **Người dùng (User)** | Người làm bài | Chọn quiz, trả lời, nộp bài |
| **Hệ thống (System)** | Backend API | Cung cấp dữ liệu, tính điểm |
| **Database** | Lưu trữ | Lưu quiz, câu hỏi, kết quả |
| **Timer** | Kiểm soát thời gian | Đếm ngược, tự động nộp |

---

## Sơ đồ Tương tác (Interaction Diagram)

```
User                    Frontend                Backend               Database
 |                         |                       |                      |
 |-- Click Quiz ---------->|                       |                      |
 |                         |-- GET /preview ------>|-- Query quiz ------->|
 |                         |<-- JSON response -----|<-- Return data ------|
 |                         |                       |                      |
 |-- Answer Questions ---->|                       |                      |
 | (Local state update)    |                       |                      |
 |                         |                       |                      |
 |-- Click NỘP BÀI ------->| (Confirm Modal)      |                      |
 |                         |                       |                      |
 | -- Confirm ------------>|-- POST /submit ------>|-- Calculate score -->|
 |                         |<-- Result ------------|<-- Save & return ----|
 |                         |                       |                      |
 |<-- Redirect Results ----|                       |                      |
 |                         |                       |                      |
 |-- View Results ------->| (From sessionStorage) |                      |
 |                         |                       |                      |
```

---

## Danh sách API Endpoints

| Endpoint | Method | Purpose | UC |
|----------|--------|---------|-----|
| `/quiz-groups/[id]/quizzes` | GET | Lấy danh sách quiz | UC1 |
| `/quiz-mock-tests/[id]/preview` | GET | Tải dữ liệu bài thi | UC3 |
| `/quiz-mock-tests/[id]/submit` | POST | Nộp bài | UC11 |
| `/user-question-answers` | POST | Lưu câu trả lời | UC12 |
| `/user-learning-items/[id]/review` | POST | Lưu kết quả ôn tập | UC9 |
| `/user-learning-items/due` | GET | Lấy danh sách ôn tập | UC8 |

---

## Danh sách State Quản lý

| State | Type | Purpose | UC |
|-------|------|---------|-----|
| `quizData` | Object | Dữ liệu bài thi | UC3, UC4 |
| `answers` | Record<number, number> | Đáp án đã chọn | UC5, UC11 |
| `marks` | Record<number, boolean> | Câu đánh dấu | UC6 |
| `timeLeft` | number | Thời gian còn lại (giây) | UC10 |
| `loading` | boolean | Trạng thái tải | UC3 |
| `submitting` | boolean | Trạng thái nộp | UC11 |
| `highlightMode` | boolean | Chế độ highlight | UC7 |

---

## File liên quan trong dự án

- **Frontend trang chính**: `src/app/(public)/quiz-taking/[id]/page.tsx` (750+ lines)
- **Trang kết quả**: `src/app/(public)/quiz-results/[id]/page.tsx`
- **Trang ôn tập**: `src/app/(public)/review/page.tsx`
- **Trang lịch sử**: `src/app/(public)/quiz-history/page.tsx`
- **Service tương tác**: 
  - `src/share/services/quiz_mock_test/quiz-mocktest.service.ts`
  - `src/share/services/user_question_answer/user-question-answer.service.ts`
  - `src/share/services/user_learning_item/user-learning-item.service.ts`

