# Library API Documentation

This document describes the Library API system that allows admins to manage course materials and weekly recorded sessions.

## Overview

The Library API provides two main functionalities:
1. **Library Management**: Store and manage course materials with Google Drive links
2. **Weekly Session Management**: Create weekly topics with recorded session links, deadlines, and submission control

## Base URL
```
/library
```

## Authentication
All admin-only endpoints require authentication using the `adminProtect` middleware.

---

## Library Endpoints

### 1. Create Library Material
**POST** `/library`

Creates a new library material with course resources.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Introduction to Programming",
  "description": "Basic programming concepts and examples",
  "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
  "semester": "Fall 2024"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Library material created successfully",
  "data": {
    "libraryId": 1,
    "title": "Introduction to Programming",
    "description": "Basic programming concepts and examples",
    "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
    "semester": "Fall 2024",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Libraries
**GET** `/library`

Retrieves all library materials. Can be filtered by semester.

**Query Parameters:**
- `semester` (optional): Filter by semester

**Example:**
```
GET /library?semester=Fall 2024
```

**Response:**
```json
{
  "status": "success",
  "message": "Libraries retrieved successfully",
  "data": {
    "libraries": [
      {
        "libraryId": 1,
        "title": "Introduction to Programming",
        "description": "Basic programming concepts and examples",
        "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
        "semester": "Fall 2024",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Libraries by Admin
**GET** `/library/my-libraries`

Retrieves all library materials created by the authenticated admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Your libraries retrieved successfully",
  "data": {
    "libraries": [...]
  }
}
```

### 4. Get Library by ID
**GET** `/library/:libraryId`

Retrieves a specific library material by ID.

**Response:**
```json
{
  "status": "success",
  "message": "Library retrieved successfully",
  "data": {
    "libraryId": 1,
    "title": "Introduction to Programming",
    "description": "Basic programming concepts and examples",
    "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
    "semester": "Fall 2024",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Update Library
**PATCH** `/library/:libraryId`

Updates a library material. Only the admin who created it can update.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Introduction to Programming",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Library updated successfully",
  "data": { "libraryId": 1 }
}
```

### 6. Delete Library
**DELETE** `/library/:libraryId`

Soft deletes a library material. Only the admin who created it can delete.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Library deleted successfully",
  "data": { "libraryId": 1 }
}
```

---

## Weekly Session Endpoints

### 1. Create Weekly Session
**POST** `/library/weekly-session`

Creates a new weekly session with topic, recorded link, and deadline.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "weekNumber": 1,
  "topic": "Introduction to Variables",
  "description": "Understanding data types and variable declaration",
  "recordedSessionLink": "https://meet.google.com/abc-defg-hij",
  "deadline": "2024-01-22T23:59:59.000Z",
  "semester": "Fall 2024"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Weekly session created successfully",
  "data": {
    "weeklySessionId": 1,
    "weekNumber": 1,
    "topic": "Introduction to Variables",
    "description": "Understanding data types and variable declaration",
    "recordedSessionLink": "https://meet.google.com/abc-defg-hij",
    "deadline": "2024-01-22T23:59:59.000Z",
    "semester": "Fall 2024",
    "isSubmissionOpen": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Weekly Sessions
**GET** `/library/weekly-session`

Retrieves all weekly sessions. Can be filtered by semester.

**Query Parameters:**
- `semester` (optional): Filter by semester

**Response:**
```json
{
  "status": "success",
  "message": "Weekly sessions retrieved successfully",
  "data": {
    "weeklySessions": [
      {
        "weeklySessionId": 1,
        "weekNumber": 1,
        "topic": "Introduction to Variables",
        "description": "Understanding data types and variable declaration",
        "recordedSessionLink": "https://meet.google.com/abc-defg-hij",
        "deadline": "2024-01-22T23:59:59.000Z",
        "semester": "Fall 2024",
        "isSubmissionOpen": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Weekly Sessions by Admin
**GET** `/library/weekly-session/my-sessions`

Retrieves all weekly sessions created by the authenticated admin.

**Headers:**
```
Authorization: Bearer <admin_token>
```

### 4. Get Weekly Session by ID
**GET** `/library/weekly-session/:weeklySessionId`

Retrieves a specific weekly session by ID.

### 5. Update Weekly Session
**PATCH** `/library/weekly-session/:weeklySessionId`

Updates a weekly session. Only the admin who created it can update.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "topic": "Updated Introduction to Variables",
  "recordedSessionLink": "https://meet.google.com/updated-link",
  "deadline": "2024-01-25T23:59:59.000Z"
}
```

### 6. Delete Weekly Session
**DELETE** `/library/weekly-session/:weeklySessionId`

Soft deletes a weekly session. Only the admin who created it can delete.

**Headers:**
```
Authorization: Bearer <admin_token>
```

### 7. Toggle Submission Status
**PATCH** `/library/weekly-session/:weeklySessionId/toggle-submission`

Opens or closes submission for a weekly session.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isSubmissionOpen": false
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Submission closed successfully",
  "data": {
    "weeklySessionId": 1,
    "isSubmissionOpen": false
  }
}
```

### 8. Get Weekly Session by Week Number
**GET** `/library/weekly-session/week/:weekNumber/semester/:semester`

Retrieves a weekly session by week number and semester.

**Example:**
```
GET /library/weekly-session/week/1/semester/Fall 2024
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "data": {
    "message": "Error description"
  }
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Features

### Library Management
- ✅ Create course materials with Google Drive links
- ✅ Organize materials by semester
- ✅ Update and delete materials
- ✅ Access control (admins can only modify their own materials)

### Weekly Session Management
- ✅ Create weekly topics with recorded session links
- ✅ Set deadlines for submissions
- ✅ Toggle submission status (open/close)
- ✅ Organize by week number and semester
- ✅ Prevent duplicate week numbers per admin per semester
- ✅ Validate deadlines are in the future

### Security Features
- ✅ Admin authentication required for modifications
- ✅ Ownership validation (admins can only modify their own content)
- ✅ Input validation and sanitization
- ✅ Soft delete functionality

---

## Usage Examples

### Creating a Complete Weekly Session
```bash
# 1. Create library material
curl -X POST http://localhost:3000/library/library \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Week 1 Materials",
    "description": "All materials for week 1",
    "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
    "semester": "Fall 2024"
  }'

# 2. Create weekly session
curl -X POST http://localhost:3000/library/weekly-session \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weekNumber": 1,
    "topic": "Introduction to Programming",
    "description": "Basic concepts and setup",
    "recordedSessionLink": "https://meet.google.com/abc-defg-hij",
    "deadline": "2024-01-22T23:59:59.000Z",
    "semester": "Fall 2024"
  }'

# 3. Close submission after deadline
curl -X PATCH http://localhost:3000/library/weekly-session/1/toggle-submission \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"isSubmissionOpen": false}'
```

This API system provides a complete solution for managing course materials and weekly sessions with proper access control and deadline management.

