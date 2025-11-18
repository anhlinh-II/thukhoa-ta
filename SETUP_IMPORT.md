# Quiz Import Feature Setup

## Frontend Implementation ✅
- ✅ Created: `src/app/admin/quiz-management/quiz-mocktests/import/page.tsx` (5-step import workflow)
- ✅ Updated: `src/app/admin/quiz-management/quiz-mocktests/page.tsx` (added "Import from Word" button)

### Frontend Features:
1. **Step 1 - Upload**: Upload `.docx` Word file
2. **Step 2 - Markup**: Review extracted text, reassign element types (GROUP/QUESTION/OPTION/ANSWER), reorder/delete
3. **Step 3 - Preview**: View 3-sheet Excel preview (QuestionGroups, Questions, QuestionOptions)
4. **Step 4 - Metadata**: Input quiz name, duration, target QuizGroup, description
5. **Step 5 - Result**: Show statistics (created entities count)

---

## Backend Implementation

### Dependencies Added to pom.xml ✅

Add these to `quiz/pom.xml` in `<dependencies>` section:

```xml
<!-- Apache POI for Word (.docx) file parsing -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- Apache POI OOXML support for .docx files -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

**Action Required**: Run clean install to download dependencies

```bash
cd quiz
./mvnw.cmd clean install -q
```

Or if you want to see the download progress:
```bash
cd quiz
./mvnw.cmd clean install
```

### New Java Classes Created ✅

#### DTOs:
- `com.example.quiz.model.dto.TextElementDto` - Text element with type (GROUP/QUESTION/OPTION/ANSWER/CONTENT)
- `com.example.quiz.model.dto.ExcelPreviewDto` - 3-sheet Excel preview structure
- `com.example.quiz.model.dto.QuestionGroupExcelDto` - Question group for Excel
- `com.example.quiz.model.dto.QuestionExcelDto` - Question for Excel
- `com.example.quiz.model.dto.QuestionOptionExcelDto` - Question option for Excel
- `com.example.quiz.model.dto.QuizImportRequestDto` - Import request payload
- `com.example.quiz.model.dto.QuizImportResultDto` - Import result (created counts, errors)

#### Services:
- `com.example.quiz.service.impl.WordImportService` - Parse Word documents and convert to Excel
- `com.example.quiz.service.impl.QuizImportService` - Batch import (create quiz, groups, questions, options)

#### Controller:
- `com.example.quiz.controller.QuizImportController` - 3 endpoints:
  - `POST /api/import/quiz/parse-word` - Parse Word file
  - `POST /api/import/quiz/elements-to-excel` - Convert elements to Excel preview
  - `POST /api/import/quiz/process` - Process import (batch create with transaction rollback)

---

## Word Format Guide

### Markup Syntax:
Format your Word document with Heading styles and markers:

| Element | Style | Format | Example |
|---------|-------|--------|---------|
| GROUP | Heading 1 | `[GROUP] Group Name` | `[GROUP] Reading Comprehension` |
| QUESTION | Heading 2 | `[QUESTION] Question text` | `[QUESTION] What is the main idea?` |
| OPTION | Normal | `A) Option text` | `A) First option` |
| ANSWER | Heading 3 | `[ANSWER] Key` | `[ANSWER] B` |

### Example Word Document Structure:
```
[Heading 1] [GROUP] English Listening - Part A
[Normal] General instructions about this group...

[Heading 2] [QUESTION] Listen to the conversation. What does the woman want?
A) To book a flight
B) To change a reservation
C) To cancel a booking
D) To upgrade her seat
[Heading 3] [ANSWER] B

[Heading 2] [QUESTION] Where are they talking?
A) At a restaurant
B) At an airport
C) At a hotel
D) At a train station
[Heading 3] [ANSWER] A

[Heading 1] [GROUP] English Reading - Part B
...
```

---

## API Endpoints

### 1. Parse Word File
```
POST /api/import/quiz/parse-word
Content-Type: multipart/form-data

Parameters:
- wordFile: File (.docx)

Response:
{
  "success": true,
  "elements": [
    {
      "id": "uuid",
      "type": "GROUP|QUESTION|OPTION|ANSWER|CONTENT",
      "text": "...",
      "order": 0
    }
  ],
  "count": 42
}
```

### 2. Convert to Excel Preview
```
POST /api/import/quiz/elements-to-excel
Content-Type: application/json

Request Body:
{
  "elements": [
    {"id": "...", "type": "GROUP", "text": "...", "order": 0},
    ...
  ]
}

Response:
{
  "success": true,
  "preview": {
    "questionGroups": [...],
    "questions": [...],
    "questionOptions": [...],
    "errors": []
  }
}
```

### 3. Process Import
```
POST /api/import/quiz/process
Content-Type: application/json

Request Body:
{
  "elements": [...],
  "quizName": "TOEIC Practice Test 1",
  "durationMinutes": 120,
  "quizGroupId": 5,
  "description": "Optional description"
}

Response:
{
  "success": true,
  "result": {
    "created": {
      "quizzes": 1,
      "questionGroups": 3,
      "questions": 45,
      "questionOptions": 180
    },
    "duration": 120,
    "errors": []
  }
}
```

---

## Testing Flow

1. **Navigate to**: `http://localhost:3000/admin/quiz-management/quiz-mocktests`
2. **Click**: "Import from Word" button
3. **Upload**: A properly formatted `.docx` file (see format guide above)
4. **Review**: Extracted text with color-coded types
5. **Adjust**: Reorder/delete elements if needed
6. **Preview**: Check 3-sheet Excel data
7. **Enter**: Quiz metadata (name, duration, group)
8. **Import**: Process import and see results

---

## Next Steps

1. ✅ Run `./mvnw.cmd clean install` in `quiz/` folder to download POI dependencies
2. ✅ Start backend: `./mvnw.cmd spring-boot:run`
3. ✅ Start frontend: `npm run dev` in `quiz-fe/`
4. ✅ Test import workflow with a sample Word file

---

## Files Modified

**Frontend:**
- `quiz-fe/src/app/admin/quiz-management/page.tsx` - Fixed Next.js Link error (removed nested `<a>`)
- `quiz-fe/src/app/admin/quiz-management/quiz-mocktests/page.tsx` - Added Import button
- `quiz-fe/src/app/admin/quiz-management/quiz-mocktests/import/page.tsx` - NEW: Full import page

**Backend:**
- `quiz/pom.xml` - Added Apache POI dependencies
- `quiz/src/main/java/com/example/quiz/service/impl/WordImportService.java` - NEW
- `quiz/src/main/java/com/example/quiz/service/impl/QuizImportService.java` - NEW
- `quiz/src/main/java/com/example/quiz/controller/QuizImportController.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/TextElementDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/ExcelPreviewDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/QuestionGroupExcelDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/QuestionExcelDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/QuestionOptionExcelDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/QuizImportRequestDto.java` - NEW
- `quiz/src/main/java/com/example/quiz/model/dto/QuizImportResultDto.java` - NEW
