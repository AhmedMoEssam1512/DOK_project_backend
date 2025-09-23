const Assignment = require('../models/assignment_model');
const Submission = require('../models/submission_model');
const Topic = require('../models/topic_model');
const { asyncWrapper } = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const dueDateManager = require('../utils/dueDateManager');
const admin = require('../data_link/admin_data_link');

// ==================== ATTACHMENT HELPERS ====================
// Detect attachment type from URL
const detectAttachmentType = (url) => {
  if (!url || typeof url !== 'string') return 'unknown';
  const lower = url.toLowerCase();
  if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) return 'drive';
  if (lower.includes('zoom.us')) return 'zoom';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'link';
};

// Normalize attachments input into array of { type, url }
const normalizeAttachments = (input) => {
  if (!input) return [];
  const toArray = Array.isArray(input) ? input : [input];
  return toArray
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        return { type: detectAttachmentType(item), url: item };
      }
      if (typeof item === 'object') {
        const url = item.url || item.link || '';
        const type = item.type || detectAttachmentType(url);
        if (!url) return null;
        return { type, url };
      }
      return null;
    })
    .filter(Boolean);
};

// Create Assignment
const createAssignment = asyncWrapper(async (req, res) => {
  const assignmentData = req.body;
  const adminId = req.admin.adminId;
  
  // Add adminId to assignment data
  assignmentData.adminId = adminId;
  
  
  // Accept either `attachment` (single) or `attachments` (array) in body and normalize
  if (assignmentData.attachment && !assignmentData.attachments) {
    assignmentData.attachments = [assignmentData.attachment];
  }
  assignmentData.attachments = normalizeAttachments(assignmentData.attachments);
  
  // Auto-increment order for the topic
  if (assignmentData.topicId) {
    const lastAssignment = await Assignment.findOne({
      where: { 
        topicId: assignmentData.topicId,
        isActive: true
      },
      order: [['order', 'DESC']]
    });
    
    assignmentData.order = lastAssignment ? lastAssignment.order + 1 : 1;
  }
  
  const newAssignment = await Assignment.create(assignmentData);
  
  // If assignment is assigned to a topic, update topic's assignmentIds
  if (assignmentData.topicId) {
    // Note: Topic model doesn't have assignmentIds array, this is handled by foreign key relationship
    // The assignment.topicId already links to the topic
  }
  
  // Get admin name for response
  const adminName = req.admin.name;
  
  // Convert assignment to JSON and add admin name to publisher
  const assignmentResponse = newAssignment.toJSON();
  assignmentResponse.publisher = adminName;
  
    return res.status(201).json({
    status: "success",
    message: "Assignment created successfully",
    data: {
      assignment: assignmentResponse
    }
    });
});

// Get All Assignments
const getAllAssignments = asyncWrapper(async (req, res) => {
  const { topicId, semester, isPublished } = req.query;
  
  // Validate that topicId is provided
  if (!topicId) {
    return res.status(400).json({
      status: "error",
      message: "topicId is required to get assignments for a specific topic"
    });
  }
  
  const whereClause = { isActive: true, isPublished: true, topicId: topicId };
  
  if (semester) whereClause.semester = semester;
  if (isPublished !== undefined) whereClause.isPublished = isPublished === 'true';
  
  const assignments = await Assignment.findAll({
    where: whereClause,
    order: [['order', 'ASC']]
  });

  // Get admin name for response
  const adminName = req.admin.name;
  
  // Add admin name to publisher for each assignment
  const assignmentsWithPublisher = assignments.map(assignment => {
    const assignmentResponse = assignment.toJSON();
    assignmentResponse.publisher = adminName;
    return assignmentResponse;
  });

    return res.status(200).json({
        status: "success",
    message: "Assignments retrieved successfully",
    data: {
      count: assignmentsWithPublisher.length,
      assignments: assignmentsWithPublisher,
    }
  });
});

// Get Assignment by ID
const getAssignmentById = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found"
    });
  }
  
  // Get admin name for response
  const adminName = req.admin.name;
  
  // Convert assignment to JSON and add admin name to publisher
  const assignmentResponse = assignment.toJSON();
  assignmentResponse.publisher = adminName;
  
    return res.status(200).json({
        status: "success",
    message: "Assignment retrieved successfully",
    data: {
      assignment: assignmentResponse
    }
  });
});

// Update Assignment
const updateAssignment = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  const updateData = req.body;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found"
    });
  }
  

  // Update assignment
  await assignment.update(updateData);

  // Get admin name for response
  const adminName = req.admin.name;
  
  // Convert assignment to JSON and add admin name to publisher
  const assignmentResponse = assignment.toJSON();
  assignmentResponse.publisher = adminName;

    return res.status(200).json({
        status: "success",
    message: "Assignment updated successfully",
    data: {
      assignment: assignmentResponse
    }
  });
});

// Delete Assignment
const deleteAssignment = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found"
    });
  }
  
  // Soft delete
  await assignment.update({ isActive: false });
  
  // Remove from topic if assigned
  if (assignment.topicId) {
    // Note: Topic model doesn't have assignmentIds array, this is handled by foreign key relationship
    // The assignment.topicId already links to the topic
  }

  return res.status(200).json({
    status: "success",
    message: "Assignment deleted successfully"
  });
});

// Publish Assignment
const publishAssignment = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found"
    });
  }
  
  await assignment.update({ 
    isPublished: true, 
    publishedAt: new Date()
  });
  
  return res.status(200).json({
    status: "success",
    message: "Assignment published successfully",
    data: {
      assignment
    }
  });
});

// Toggle Late Submission Policy
const toggleLateSubmissionPolicy = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  const { allowLateSubmissions } = req.body;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found"
    });
  }
  
  await assignment.update({ allowLateSubmissions });
  
  return res.status(200).json({
    status: "success",
    message: `Late submissions ${allowLateSubmissions ? 'enabled' : 'disabled'} successfully`,
    data: {
      assignment
    }
  });
});

module.exports = {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
    toggleLateSubmissionPolicy,
};