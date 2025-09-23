# Library Submission API Documentation

This document describes the enhanced submission system that integrates with the Google Classroom-like Library API, allowing students to submit assignments and quizzes created through the library system.

## Overview

The submission system now supports:
1. **Library Material Submissions**: Submit assignments and quizzes created through the library system
2. **Existing Quiz/Assignment Submissions**: Continue to work with your existing quiz and assignment system
3. **Unified Submission Management**: Admins can manage all submissions in one place
4. **Google Classroom Integration**: Seamless integration with the new library materials

## Base URL
```
/library
```

## Authentication
- Student endpoints require `studentProtect` middleware
- Admin endpoints require `adminProtect` middleware

---

## Student Submission Endpoints

### 1. Submit Library Material
**POST** `/library/library/:libraryId/submit`

Submit an assignment or quiz created through the library system.

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "answers": "Your detailed answers to the assignment or quiz questions"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Library material submitted successfully",
  "data": {
    "submissionId": 123,
    "libraryId": 1,
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validation:**
- Material must exist and be published
- Material type must be 'assignment' or 'quiz'
- Student cannot submit the same material twice
- Submission must be before due date (if set)

### 2. Get My Library Submissions
**GET** `/library/library/my-submissions`

Retrieve all library material submissions by the authenticated student.

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Your library submissions retrieved successfully",
  "data": {
    "submissions": [
      {
        "submissionId": 123,
        "libraryId": 1,
        "answers": "Your answers...",
        "score": 85,
        "marked": "true",
        "submittedAt": "2024-01-15T10:30:00.000Z",
        "markedAt": "2024-01-16T09:15:00.000Z"
      }
    ]
  }
}
```

### 3. Get Unsubmitted Library Materials
**GET** `/library/library/unsubmitted-materials`

Get all library materials (assignments/quizzes) that the student hasn't submitted yet.

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Unsubmitted library materials retrieved successfully",
  "data": {
    "unsubmittedMaterials": [
      {
        "libraryId": 2,
        "title": "Programming Assignment 2",
        "description": "Advanced programming concepts",
        "materialType": "assignment",
        "content": "Write a program that implements a binary tree",
        "points": 100,
        "dueDate": "2024-01-25T23:59:59.000Z",
        "topic": {
          "topicId": 1,
          "name": "Week 2 - Data Structures"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Admin Submission Management Endpoints

### 1. Get Submissions for Library Material
**GET** `/library/library/:libraryId/submissions`

Get all submissions for a specific library material.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Library material submissions retrieved successfully",
  "data": {
    "libraryId": 1,
    "materialTitle": "Programming Assignment 1",
    "submissions": [
      {
        "submissionId": 123,
        "studentId": 456,
        "answers": "Student's answers...",
        "score": 85,
        "marked": "true",
        "submittedAt": "2024-01-15T10:30:00.000Z",
        "markedAt": "2024-01-16T09:15:00.000Z"
      }
    ]
  }
}
```

### 2. Get Unmarked Library Submissions
**GET** `/library/library/submissions/unmarked`

Get all unmarked library material submissions for the authenticated admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Unmarked library submissions retrieved successfully",
  "data": {
    "submissions": [
      {
        "submissionId": 124,
        "libraryId": 2,
        "studentId": 457,
        "answers": "Student's answers...",
        "submittedAt": "2024-01-15T11:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get All Library Submissions
**GET** `/library/library/submissions/all`

Get all library material submissions for the authenticated admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

### 4. Get Library Submission by ID
**GET** `/library/library/submission/:submissionId`

Get a specific library submission by ID.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Library submission retrieved successfully",
  "data": {
    "submission": {
      "submissionId": 123,
      "libraryId": 1,
      "studentId": 456,
      "answers": "Student's detailed answers...",
      "score": 85,
      "marked": "true",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "markedAt": "2024-01-16T09:15:00.000Z"
    }
  }
}
```

### 5. Mark Library Submission
**PATCH** `/library/library/submission/:submissionId/mark`

Mark a library submission with a score.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "score": 85,
  "marked": "true"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Library submission marked successfully",
  "data": {
    "submissionId": 123,
    "score": 85,
    "marked": "true",
    "markedAt": "2024-01-16T09:15:00.000Z"
  }
}
```

**Note:** This automatically updates the student's total score.

---

## Integration with Existing System

### Existing Submission Endpoints Still Work

Your existing submission system continues to work alongside the new library submissions:

**Existing Quiz Submissions:**
- `POST /quiz/:quizId/submit` - Submit quiz
- `POST /quiz/submit-active` - Submit active quiz

**Existing Assignment Submissions:**
- `POST /assignment/:assignId/submit` - Submit assignment

**Existing Admin Management:**
- `GET /admin/showUnmarkedSubmissions` - Get unmarked submissions
- `PATCH /admin/markSubmission/:id` - Mark submission

### Unified Submission Types

The submission model now supports three types:
- `quiz` - Traditional quiz submissions
- `assignment` - Traditional assignment submissions  
- `library_material` - New library material submissions

---

## Usage Examples

### Complete Workflow Example

```bash
# 1. Admin creates a topic
curl -X POST http://localhost:3000/library/topic \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1 - Introduction",
    "description": "Basic programming concepts",
    "semester": "Fall 2024"
  }'

# 2. Admin creates an assignment in the library
curl -X POST http://localhost:3000/library/library \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Programming Assignment 1",
    "description": "Complete the following exercises",
    "materialType": "assignment",
    "content": "Write a program that calculates factorial",
    "points": 100,
    "dueDate": "2024-01-22T23:59:59.000Z",
    "topicId": 1,
    "semester": "Fall 2024"
  }'

# 3. Student gets unsubmitted materials
curl -X GET http://localhost:3000/library/library/unsubmitted-materials \
  -H "Authorization: Bearer <student_token>"

# 4. Student submits the assignment
curl -X POST http://localhost:3000/library/library/1/submit \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": "Here is my factorial program:\n\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120"
  }'

# 5. Admin gets unmarked submissions
curl -X GET http://localhost:3000/library/library/submissions/unmarked \
  -H "Authorization: Bearer <admin_token>"

# 6. Admin marks the submission
curl -X PATCH http://localhost:3000/library/library/submission/123/mark \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 95,
    "marked": "true"
  }'

# 7. Student checks their submissions
curl -X GET http://localhost:3000/library/library/my-submissions \
  -H "Authorization: Bearer <student_token>"
```

---

## Key Features

### ✅ **Seamless Integration**
- Works alongside existing quiz/assignment system
- Unified submission management for admins
- Same authentication and authorization patterns

### ✅ **Google Classroom Compatibility**
- Submissions work with library materials organized by topics
- Due date validation and enforcement
- Publishing control (only published materials can be submitted)

### ✅ **Comprehensive Management**
- Students can see unsubmitted materials
- Admins can view all submissions by material
- Automatic total score updates
- Proper authorization and ownership validation

### ✅ **Enhanced Data Model**
- Support for longer answers (TEXT field)
- Library material type in submissions
- Proper relationships between library materials and submissions

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "data": {
    "message": "Error description"
  }
}
```

**Common Error Scenarios:**
- Material not found or not published
- Student already submitted the material
- Submission deadline has passed
- Unauthorized access to submissions
- Invalid material type for submission

This enhanced submission system provides a complete Google Classroom-like experience while maintaining compatibility with your existing quiz and assignment system.

