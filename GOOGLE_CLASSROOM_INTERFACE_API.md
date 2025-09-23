# Google Classroom Interface API Documentation

This document describes the enhanced Library API that provides a complete Google Classroom-like interface for creating assignments and class materials, exactly matching the interface shown in your images.

## Overview

The API now supports all the features shown in the Google Classroom interface:
- **Rich Text Editing** - Bold, italic, underline, lists, formatting
- **Multiple Attachment Types** - Drive, YouTube, Upload, Link, Create
- **Assignment Settings** - Points, due dates, topics, rubrics
- **Draft Management** - Save drafts, publish, schedule
- **Student Assignment** - Assign to all students or specific students

## Base URL
```
/library
```

## Authentication
All admin endpoints require authentication using the `adminProtect` middleware.

---

## Creating Assignments and Materials

### 1. Create Assignment (Google Classroom Style)
**POST** `/library/library`

Creates an assignment with rich content, attachments, and settings exactly like Google Classroom.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body Example:**
```json
{
  "title": "Programming Assignment 1",
  "description": "Complete the following programming exercises",
  "materialType": "assignment",
  "instructions": "<p><strong>Instructions:</strong></p><p>Write a program that calculates the factorial of a number.</p><ul><li>Use recursion</li><li>Handle edge cases</li><li>Include comments</li></ul>",
  "content": "<p>Additional content and resources for the assignment.</p>",
  "attachments": [
    {
      "type": "drive",
      "url": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
      "title": "Course Materials",
      "description": "All course materials and resources"
    },
    {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=example",
      "title": "Tutorial Video",
      "description": "How to solve factorial problems"
    },
    {
      "type": "link",
      "url": "https://example.com/reference",
      "title": "Reference Documentation",
      "description": "Official documentation"
    }
  ],
  "rubric": {
    "title": "Programming Assignment Rubric",
    "description": "Grading criteria for the assignment",
    "criteria": [
      {
        "title": "Code Quality",
        "description": "Clean, readable, and well-commented code",
        "points": 30,
        "levels": [
          { "title": "Excellent", "points": 30, "description": "Perfect code quality" },
          { "title": "Good", "points": 20, "description": "Good code quality" },
          { "title": "Fair", "points": 10, "description": "Acceptable code quality" }
        ]
      },
      {
        "title": "Functionality",
        "description": "Correct implementation and output",
        "points": 50,
        "levels": [
          { "title": "Excellent", "points": 50, "description": "Perfect functionality" },
          { "title": "Good", "points": 35, "description": "Mostly correct" },
          { "title": "Fair", "points": 20, "description": "Partially working" }
        ]
      },
      {
        "title": "Edge Cases",
        "description": "Handles edge cases properly",
        "points": 20,
        "levels": [
          { "title": "Excellent", "points": 20, "description": "All edge cases handled" },
          { "title": "Good", "points": 15, "description": "Most edge cases handled" },
          { "title": "Fair", "points": 10, "description": "Some edge cases handled" }
        ]
      }
    ]
  },
  "points": 100,
  "dueDate": "2024-01-22T23:59:59.000Z",
  "topicId": 1,
  "semester": "Fall 2024",
  "assignTo": "all_students",
  "assignedStudents": [],
  "isDraft": false,
  "scheduledDate": null
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
    "instructions": "<p><strong>Instructions:</strong></p><p>Write a program that calculates the factorial of a number.</p><ul><li>Use recursion</li><li>Handle edge cases</li><li>Include comments</li></ul>",
    "content": "<p>Additional content and resources for the assignment.</p>",
    "attachments": [
      {
        "id": 1704067200000,
        "type": "drive",
        "url": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
        "title": "Course Materials",
        "description": "All course materials and resources",
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "rubric": {
      "id": 1704067200000,
      "title": "Programming Assignment Rubric",
      "description": "Grading criteria for the assignment",
      "criteria": [...],
      "totalPoints": 100,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "points": 100,
    "dueDate": "2024-01-22T23:59:59.000Z",
    "topicId": 1,
    "semester": "Fall 2024",
    "assignTo": "all_students",
    "assignedStudents": [],
    "isPublished": true,
    "isDraft": false,
    "scheduledDate": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Material (Google Classroom Style)
**POST** `/library/library`

Creates a material with attachments and rich content.

**Request Body Example:**
```json
{
  "title": "Week 1 Course Materials",
  "description": "All materials for week 1",
  "materialType": "material",
  "content": "<p><strong>Welcome to Week 1!</strong></p><p>This week we will cover:</p><ul><li>Introduction to Programming</li><li>Variables and Data Types</li><li>Basic Control Structures</li></ul>",
  "attachments": [
    {
      "type": "drive",
      "url": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
      "title": "Week 1 Materials",
      "description": "All course materials and resources"
    },
    {
      "type": "upload",
      "url": "/uploads/week1-notes.pdf",
      "title": "Lecture Notes",
      "description": "PDF notes from the lecture"
    }
  ],
  "topicId": 1,
  "semester": "Fall 2024",
  "assignTo": "all_students"
}
```

---

## Attachment Types

The system supports all attachment types shown in Google Classroom:

### 1. Google Drive
```json
{
  "type": "drive",
  "url": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
  "title": "Course Materials",
  "description": "All course materials and resources"
}
```

### 2. YouTube
```json
{
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=example",
  "title": "Tutorial Video",
  "description": "How to solve the problem"
}
```

### 3. Upload
```json
{
  "type": "upload",
  "url": "/uploads/document.pdf",
  "title": "Document",
  "description": "Uploaded file"
}
```

### 4. Link
```json
{
  "type": "link",
  "url": "https://example.com/reference",
  "title": "Reference",
  "description": "External reference"
}
```

### 5. Create
```json
{
  "type": "create",
  "url": "/create/document",
  "title": "New Document",
  "description": "Create new document"
}
```

---

## Draft and Publishing Management

### 1. Save as Draft
**PATCH** `/library/library/:libraryId/save-draft`

Save material as draft without publishing.

**Response:**
```json
{
  "status": "success",
  "message": "Material saved as draft successfully",
  "data": { "libraryId": 1, "isDraft": true }
}
```

### 2. Publish Material
**PATCH** `/library/library/:libraryId/publish`

Publish a draft material.

**Response:**
```json
{
  "status": "success",
  "message": "Material published successfully",
  "data": { "libraryId": 1, "isPublished": true }
}
```

### 3. Schedule Material
**PATCH** `/library/library/:libraryId/schedule`

Schedule material for future publication.

**Request Body:**
```json
{
  "scheduledDate": "2024-01-20T09:00:00.000Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Material scheduled successfully",
  "data": { 
    "libraryId": 1, 
    "scheduledDate": "2024-01-20T09:00:00.000Z" 
  }
}
```

### 4. Get Drafts
**GET** `/library/library/drafts`

Get all draft materials.

**Response:**
```json
{
  "status": "success",
  "message": "Drafts retrieved successfully",
  "data": {
    "drafts": [
      {
        "libraryId": 1,
        "title": "Draft Assignment",
        "description": "Work in progress",
        "materialType": "assignment",
        "scheduledDate": "2024-01-20T09:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Attachment Management

### 1. Add Attachment
**POST** `/library/library/:libraryId/attachments`

Add an attachment to existing material.

**Request Body:**
```json
{
  "attachment": {
    "type": "youtube",
    "url": "https://www.youtube.com/watch?v=example",
    "title": "New Tutorial",
    "description": "Additional tutorial video"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Attachment added successfully",
  "data": {
    "libraryId": 1,
    "attachment": {
      "id": 1704067200000,
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=example",
      "title": "New Tutorial",
      "description": "Additional tutorial video",
      "addedAt": "2024-01-15T10:30:00.000Z"
    },
    "totalAttachments": 2
  }
}
```

### 2. Remove Attachment
**DELETE** `/library/library/:libraryId/attachments/:attachmentId`

Remove an attachment from material.

**Response:**
```json
{
  "status": "success",
  "message": "Attachment removed successfully",
  "data": {
    "libraryId": 1,
    "removedAttachmentId": "1704067200000",
    "totalAttachments": 1
  }
}
```

---

## Rubric Management

### 1. Create Rubric
**POST** `/library/library/:libraryId/rubric`

Create a rubric for an assignment.

**Request Body:**
```json
{
  "rubric": {
    "title": "Assignment Rubric",
    "description": "Grading criteria",
    "criteria": [
      {
        "title": "Code Quality",
        "description": "Clean and readable code",
        "points": 40,
        "levels": [
          { "title": "Excellent", "points": 40, "description": "Perfect code" },
          { "title": "Good", "points": 30, "description": "Good code" },
          { "title": "Fair", "points": 20, "description": "Acceptable code" }
        ]
      },
      {
        "title": "Functionality",
        "description": "Correct implementation",
        "points": 60,
        "levels": [
          { "title": "Excellent", "points": 60, "description": "Perfect functionality" },
          { "title": "Good", "points": 45, "description": "Mostly correct" },
          { "title": "Fair", "points": 30, "description": "Partially working" }
        ]
      }
    ]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Rubric created successfully",
  "data": {
    "libraryId": 1,
    "rubric": {
      "id": 1704067200000,
      "title": "Assignment Rubric",
      "description": "Grading criteria",
      "criteria": [...],
      "totalPoints": 100,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Update Rubric
**PATCH** `/library/library/:libraryId/rubric`

Update an existing rubric.

---

## Rich Text Content

The system supports rich text content with HTML formatting:

### Supported Formatting:
- **Bold**: `<strong>text</strong>` or `<b>text</b>`
- **Italic**: `<em>text</em>` or `<i>text</i>`
- **Underline**: `<u>text</u>`
- **Lists**: `<ul><li>item</li></ul>` or `<ol><li>item</li></ol>`
- **Paragraphs**: `<p>text</p>`
- **Line breaks**: `<br>`

### Example Rich Content:
```html
<p><strong>Instructions:</strong></p>
<p>Complete the following tasks:</p>
<ul>
  <li>Write a factorial function</li>
  <li>Handle edge cases</li>
  <li>Include proper comments</li>
</ul>
<p><em>Note:</em> Make sure your code is clean and readable.</p>
```

---

## Complete Workflow Example

```bash
# 1. Create topic
curl -X POST http://localhost:3000/library/topic \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1 - Introduction",
    "description": "Basic programming concepts",
    "semester": "Fall 2024"
  }'

# 2. Create assignment with rich content and attachments
curl -X POST http://localhost:3000/library/library \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Programming Assignment 1",
    "description": "Complete the following exercises",
    "materialType": "assignment",
    "instructions": "<p><strong>Instructions:</strong></p><p>Write a factorial program with the following requirements:</p><ul><li>Use recursion</li><li>Handle edge cases (0, negative numbers)</li><li>Include comments</li></ul>",
    "attachments": [
      {
        "type": "drive",
        "url": "https://drive.google.com/drive/folders/1dzrQGtXQgRSHOKgOdFHBl4WeHNSibh5z",
        "title": "Course Materials",
        "description": "All course materials"
      }
    ],
    "points": 100,
    "dueDate": "2024-01-22T23:59:59.000Z",
    "topicId": 1,
    "semester": "Fall 2024"
  }'

# 3. Add rubric to assignment
curl -X POST http://localhost:3000/library/library/1/rubric \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rubric": {
      "title": "Programming Assignment Rubric",
      "criteria": [
        {
          "title": "Code Quality",
          "description": "Clean and readable code",
          "points": 40
        },
        {
          "title": "Functionality",
          "description": "Correct implementation",
          "points": 60
        }
      ]
    }
  }'

# 4. Add YouTube attachment
curl -X POST http://localhost:3000/library/library/1/attachments \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "attachment": {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=example",
      "title": "Tutorial Video",
      "description": "How to solve factorial problems"
    }
  }'

# 5. Publish the assignment
curl -X PATCH http://localhost:3000/library/library/1/publish \
  -H "Authorization: Bearer <admin_token>"
```

---

## Key Features

### ✅ **Complete Google Classroom Interface**
- Rich text editing with formatting toolbar
- Multiple attachment types (Drive, YouTube, Upload, Link, Create)
- Assignment settings (points, due dates, topics)
- Draft management and scheduling
- Rubric creation and management

### ✅ **Rich Content Support**
- HTML formatting for instructions and content
- Support for bold, italic, underline, lists
- Proper content structure and organization

### ✅ **Attachment Management**
- Add/remove attachments dynamically
- Support for all Google Classroom attachment types
- Proper attachment metadata and descriptions

### ✅ **Assignment Features**
- Points and grading system
- Due date management
- Topic organization
- Student assignment (all or specific students)
- Rubric integration

### ✅ **Publishing Control**
- Save as draft functionality
- Publish when ready
- Schedule for future publication
- Draft management interface

This API provides a complete Google Classroom-like experience for creating and managing assignments and materials, exactly matching the interface shown in your images.

