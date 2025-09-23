# Google Classroom-Style Library API Documentation

This document describes the enhanced Library API system that mimics Google Classroom's Classwork functionality, allowing admins to organize course materials by topics and create different types of content.

## Overview

The Library API now provides a Google Classroom-like experience with:
1. **Topic Management**: Organize content into topics (like "Week 1", "Physics", etc.)
2. **Material Types**: Create assignments, quizzes, materials, questions, and announcements
3. **Content Organization**: Group materials under topics with proper ordering
4. **Publishing Control**: Publish/unpublish materials
5. **Weekly Sessions**: Recorded session links with deadlines and submission control

## Base URL
```
/library
```

## Authentication
All admin-only endpoints require authentication using the `adminProtect` middleware.

---

## Topic Endpoints

### 1. Create Topic
**POST** `/library/topic`

Creates a new topic for organizing materials (like "Week 1", "Physics", etc.).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Week 1 - Introduction",
  "description": "Introduction to programming concepts",
  "semester": "Fall 2024",
  "order": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Topic created successfully",
  "data": {
    "topicId": 1,
    "name": "Week 1 - Introduction",
    "description": "Introduction to programming concepts",
    "semester": "Fall 2024",
    "order": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Topics
**GET** `/library/topic`

Retrieves all topics. Can be filtered by semester.

**Query Parameters:**
- `semester` (optional): Filter by semester

**Response:**
```json
{
  "status": "success",
  "message": "Topics retrieved successfully",
  "data": {
    "topics": [
      {
        "topicId": 1,
        "name": "Week 1 - Introduction",
        "description": "Introduction to programming concepts",
        "semester": "Fall 2024",
        "order": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Topics by Admin
**GET** `/library/topic/my-topics`

Retrieves all topics created by the authenticated admin.

### 4. Get Topic by ID
**GET** `/library/topic/:topicId`

Retrieves a specific topic by ID.

### 5. Update Topic
**PATCH** `/library/topic/:topicId`

Updates a topic. Only the admin who created it can update.

### 6. Delete Topic
**DELETE** `/library/topic/:topicId`

Soft deletes a topic. Only the admin who created it can delete.

---

## Library Endpoints (Google Classroom Style)

### 1. Create Material
**POST** `/library/library`

Creates different types of materials (assignment, quiz, material, question, announcement).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body Examples:**

#### Assignment
```json
{
  "title": "Programming Assignment 1",
  "description": "Complete the following programming exercises",
  "materialType": "assignment",
  "content": "Write a program that calculates the factorial of a number",
  "points": 100,
  "dueDate": "2024-01-22T23:59:59.000Z",
  "topicId": 1,
  "semester": "Fall 2024",
  "order": 1
}
```

#### Quiz
```json
{
  "title": "Quiz 1 - Variables and Data Types",
  "description": "Test your understanding of variables",
  "materialType": "quiz",
  "content": "Answer the following questions about variables",
  "points": 50,
  "dueDate": "2024-01-20T23:59:59.000Z",
  "topicId": 1,
  "semester": "Fall 2024",
  "order": 2
}
```

#### Material (with Google Drive link)
```json
{
  "title": "Course Materials - Week 1",
  "description": "All materials for week 1",
  "materialType": "material",
  "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
  "topicId": 1,
  "semester": "Fall 2024",
  "order": 3
}
```

#### Question
```json
{
  "title": "What is your favorite programming language?",
  "description": "Share your thoughts",
  "materialType": "question",
  "content": "Please explain why you prefer this language and provide examples",
  "topicId": 1,
  "semester": "Fall 2024",
  "order": 4
}
```

#### Announcement
```json
{
  "title": "Important: Class Schedule Change",
  "description": "Notice about schedule changes",
  "materialType": "announcement",
  "content": "The class on Friday has been moved to Thursday at the same time",
  "semester": "Fall 2024",
  "order": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Assignment created successfully",
  "data": {
    "libraryId": 1,
    "title": "Programming Assignment 1",
    "description": "Complete the following programming exercises",
    "materialType": "assignment",
    "content": "Write a program that calculates the factorial of a number",
    "points": 100,
    "dueDate": "2024-01-22T23:59:59.000Z",
    "topicId": 1,
    "semester": "Fall 2024",
    "order": 1,
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Materials (Google Classroom Style)
**GET** `/library/library`

Retrieves all materials organized by topics, just like Google Classroom.

**Query Parameters:**
- `semester` (optional): Filter by semester
- `materialType` (optional): Filter by material type
- `topicId` (optional): Filter by specific topic

**Response:**
```json
{
  "status": "success",
  "message": "Libraries retrieved successfully",
  "data": {
    "groupedByTopics": [
      {
        "topic": {
          "topicId": 1,
          "name": "Week 1 - Introduction",
          "description": "Introduction to programming concepts",
          "order": 1
        },
        "materials": [
          {
            "libraryId": 1,
            "title": "Programming Assignment 1",
            "description": "Complete the following programming exercises",
            "materialType": "assignment",
            "content": "Write a program that calculates the factorial of a number",
            "points": 100,
            "dueDate": "2024-01-22T23:59:59.000Z",
            "order": 1,
            "isPublished": true,
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
          },
          {
            "libraryId": 2,
            "title": "Quiz 1 - Variables and Data Types",
            "description": "Test your understanding of variables",
            "materialType": "quiz",
            "content": "Answer the following questions about variables",
            "points": 50,
            "dueDate": "2024-01-20T23:59:59.000Z",
            "order": 2,
            "isPublished": true,
            "createdAt": "2024-01-15T10:30:00.000Z",
            "updatedAt": "2024-01-15T10:30:00.000Z"
          }
        ]
      }
    ],
    "ungroupedMaterials": [
      {
        "libraryId": 5,
        "title": "Important: Class Schedule Change",
        "description": "Notice about schedule changes",
        "materialType": "announcement",
        "content": "The class on Friday has been moved to Thursday at the same time",
        "order": 5,
        "isPublished": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Materials by Admin
**GET** `/library/library/my-libraries`

Retrieves all materials created by the authenticated admin.

### 4. Get Material by ID
**GET** `/library/library/:libraryId`

Retrieves a specific material by ID.

### 5. Update Material
**PATCH** `/library/library/:libraryId`

Updates a material. Only the admin who created it can update.

### 6. Delete Material
**DELETE** `/library/library/:libraryId`

Soft deletes a material. Only the admin who created it can delete.

### 7. Toggle Publish Status
**PATCH** `/library/library/:libraryId/toggle-publish`

Publishes or unpublishes a material.

**Request Body:**
```json
{
  "isPublished": false
}
```

### 8. Reorder Materials
**PATCH** `/library/library/:libraryId/reorder`

Changes the order of materials within a topic.

**Request Body:**
```json
{
  "order": 3
}
```

---

## Weekly Session Endpoints

### 1. Create Weekly Session
**POST** `/library/weekly-session`

Creates a weekly session with recorded link and deadline.

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

### 2. Toggle Submission Status
**PATCH** `/library/weekly-session/:weeklySessionId/toggle-submission`

Opens or closes submission for a weekly session.

**Request Body:**
```json
{
  "isSubmissionOpen": false
}
```

---

## Material Types

The system supports the following material types (just like Google Classroom):

1. **assignment** - Graded assignments with due dates and points
2. **quiz** - Quizzes and tests
3. **material** - Course materials, readings, resources (can include Google Drive links)
4. **question** - Discussion questions for students
5. **announcement** - Important announcements and notices

---

## Google Classroom Features

### ✅ **Topic Organization**
- Create topics to group related materials
- Order topics and materials within topics
- Materials can exist without topics (ungrouped)

### ✅ **Material Types**
- Support for all Google Classroom material types
- Different icons and behaviors for each type
- Points and due dates for assignments/quizzes

### ✅ **Publishing Control**
- Draft/publish status for materials
- Control visibility to students

### ✅ **Content Management**
- Rich text content for questions and announcements
- File attachments and Google Drive integration
- Proper ordering and organization

### ✅ **Access Control**
- Admin ownership validation
- Students can only see published materials
- Proper authentication and authorization

---

## Usage Examples

### Creating a Complete Week Structure
```bash
# 1. Create topic for the week
curl -X POST http://localhost:3000/library/topic \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1 - Introduction to Programming",
    "description": "Basic programming concepts and setup",
    "semester": "Fall 2024",
    "order": 1
  }'

# 2. Create course materials with Google Drive link
curl -X POST http://localhost:3000/library/library \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Week 1 Materials",
    "description": "All materials for week 1",
    "materialType": "material",
    "driveLink": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
    "topicId": 1,
    "semester": "Fall 2024",
    "order": 1
  }'

# 3. Create assignment
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
    "semester": "Fall 2024",
    "order": 2
  }'

# 4. Create quiz
curl -X POST http://localhost:3000/library/library \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quiz 1 - Variables",
    "description": "Test your understanding",
    "materialType": "quiz",
    "content": "Answer questions about variables",
    "points": 50,
    "dueDate": "2024-01-20T23:59:59.000Z",
    "topicId": 1,
    "semester": "Fall 2024",
    "order": 3
  }'

# 5. Create weekly session with recorded link
curl -X POST http://localhost:3000/library/weekly-session \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "weekNumber": 1,
    "topic": "Introduction to Variables",
    "recordedSessionLink": "https://meet.google.com/abc-defg-hij",
    "deadline": "2024-01-22T23:59:59.000Z",
    "semester": "Fall 2024"
  }'
```

### Getting Materials (Google Classroom Style)
```bash
# Get all materials organized by topics
curl -X GET http://localhost:3000/library/library?semester=Fall 2024

# Get only assignments
curl -X GET http://localhost:3000/library/library?materialType=assignment&semester=Fall 2024

# Get materials for specific topic
curl -X GET http://localhost:3000/library/library?topicId=1
```

This API system now provides a complete Google Classroom-like experience for organizing and managing course materials, with proper topic organization, material types, and content management features.

