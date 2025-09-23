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

// ==================== SUBMISSION STATUS FUNCTIONS ====================

/* Get assignment submission summary for admin
const getAssignmentSubmissionSummary = asyncWrapper(async (req, res) => {
    const adminId = req.admin.adminId;
    const { assignmentId } = req.params;
    
    // Get assignment details
    const assignment = await Assignment.findOne({
        where: { assignmentId, isActive: true }
    });
    
    if (!assignment) {
        throw new AppError('Assignment not found', 404);
    }
    
    // Get all students in the admin's group
    const students = await admin.findVerifiedStudentsByTaGroup(req.admin.group);
    
    const submissionSummary = [];
    
    for (const student of students) {
        const submission = await Submission.findOne({
            where: {
                assignmentId: assignment.assignmentId,
                studentId: student.studentId
            }
        });
        
        const status = dueDateManager.getSubmissionStatus(assignment, submission);
        
        submissionSummary.push({
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            status: status,
            submittedAt: submission?.submittedAt || null,
            score: submission?.grade || null,
            isLate: status === 'late',
            isMissing: status === 'missing',
            daysUntilDue: dueDateManager.getDaysUntilDue(assignment.dueDate),
            formattedDueDate: dueDateManager.formatDueDate(assignment.dueDate)
        });
    }
  
    // Calculate summary statistics
    const stats = {
        total: submissionSummary.length,
        submitted: submissionSummary.filter(s => s.status === 'submitted').length,
        late: submissionSummary.filter(s => s.status === 'late').length,
        missing: submissionSummary.filter(s => s.status === 'missing').length,
        notDueYet: submissionSummary.filter(s => s.status === 'not_due_yet').length
    };
    
    return res.status(200).json({
        status: "success",
        message: "Assignment submission summary retrieved successfully",
        data: {
            assignment: {
                assignmentId: assignment.assignmentId,
                title: assignment.title,
                dueDate: assignment.dueDate,
                points: assignment.points,
                maxPoints: assignment.maxPoints,
                formattedDueDate: dueDateManager.formatDueDate(assignment.dueDate),
                isOverdue: dueDateManager.isOverdue(assignment.dueDate),
                isDueToday: dueDateManager.isDueToday(assignment.dueDate)
            },
            submissions: submissionSummary,
            statistics: stats
        }
    });
});
*/

/* Get unsubmitted assignments for students
const getUnsubmittedAssignments = asyncWrapper(async (req, res) => {
    const studentId = req.student.studentId;
    
    // Get all published assignments
    const assignments = await Assignment.findAll({
        where: { 
            isPublished: true,
            isActive: true
        },
        include: [
            {
                model: Topic,
                as: 'Topic',
                attributes: ['topicId', 'title', 'libraryId']
            }
        ]
    });
    
    const unsubmittedAssignments = [];
    
    for (const assignment of assignments) {
        // Check if student has submitted
        const submission = await Submission.findOne({
            where: {
                assignmentId: assignment.assignmentId,
                studentId: studentId
            }
        });
        
        if (!submission) {
            unsubmittedAssignments.push({
                assignmentId: assignment.assignmentId,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                points: assignment.points,
                maxPoints: assignment.maxPoints,
                topic: assignment.Topic,
                isOverdue: dueDateManager.isOverdue(assignment.dueDate),
                isDueToday: dueDateManager.isDueToday(assignment.dueDate),
                daysUntilDue: dueDateManager.getDaysUntilDue(assignment.dueDate),
                formattedDueDate: dueDateManager.formatDueDate(assignment.dueDate)
            });
        }
    }
    
    return res.status(200).json({
        status: "success",
        message: "Unsubmitted assignments retrieved successfully",
        data: {
            assignments: unsubmittedAssignments,
            count: unsubmittedAssignments.length
        }
    });
});
*/

module.exports = {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
    toggleLateSubmissionPolicy,
};