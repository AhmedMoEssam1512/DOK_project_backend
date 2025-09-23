/**
 * Due Date Manager - Google Classroom Style
 * Handles due date validation, status tracking, and calendar operations
 */

/**
 * Check if assignment is due today
 * @param {Date} dueDate - Assignment due date
 * @returns {boolean} - True if due today
 */
function isDueToday(dueDate) {
    if (!dueDate) return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return today.getTime() === due.getTime();
}

/**
 * Check if assignment is overdue
 * @param {Date} dueDate - Assignment due date
 * @returns {boolean} - True if overdue
 */
function isOverdue(dueDate) {
    if (!dueDate) return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return today.getTime() > due.getTime();
}

/**
 * Check if assignment is upcoming (due in next 7 days)
 * @param {Date} dueDate - Assignment due date
 * @returns {boolean} - True if upcoming
 */
function isUpcoming(dueDate) {
    if (!dueDate) return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    const weekFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    weekFromNow.setHours(0, 0, 0, 0);
    
    return due.getTime() > today.getTime() && due.getTime() <= weekFromNow.getTime();
}

/**
 * Get submission status for a student
 * @param {Object} assignment - Assignment object
 * @param {Object} submission - Student's submission (if exists)
 * @returns {string} - Status: 'submitted', 'missing', 'late', 'not_due_yet', 'submission_closed'
 */
function getSubmissionStatus(assignment, submission) {
    if (!assignment.dueDate) {
        return submission ? 'submitted' : 'not_submitted';
    }
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    if (submission) {
        const submittedAt = new Date(submission.subDate);
        
        if (submittedAt <= dueDate) {
            return 'submitted';
        } else {
            // Check if late submissions are allowed
            if (assignment.allowLateSubmissions) {
                return 'late';
            } else {
                return 'submission_closed'; // Submitted late but not allowed
            }
        }
    } else {
        if (now > dueDate) {
            // Check if late submissions are allowed
            if (assignment.allowLateSubmissions) {
                return 'missing'; // Can still submit late
            } else {
                return 'submission_closed'; // Cannot submit anymore
            }
        } else {
            return 'not_due_yet';
        }
    }
}

/**
 * Check if submission is still allowed
 * @param {Object} assignment - Assignment object
 * @returns {boolean} - True if submission is allowed
 */
function isSubmissionAllowed(assignment) {
    if (!assignment.dueDate) {
        return true; // No due date, always allowed
    }
    
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    
    // If not overdue, always allowed
    if (now <= dueDate) {
        return true;
    }
    
    // If overdue, check if late submissions are allowed
    return assignment.allowLateSubmissions;
}

/**
 * Get days until due date
 * @param {Date} dueDate - Assignment due date
 * @returns {number} - Days until due (negative if overdue)
 */
function getDaysUntilDue(dueDate) {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Get calendar events for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Array} assignments - Array of assignments
 * @returns {Array} - Calendar events
 */
function getCalendarEvents(year, month, assignments) {
    const events = [];
    
    assignments.forEach(assignment => {
        if (assignment.dueDate) {
            const dueDate = new Date(assignment.dueDate);
            
            // Check if assignment is in the requested month
            if (dueDate.getFullYear() === year && dueDate.getMonth() === month) {
                const status = getSubmissionStatus(assignment, assignment.submission);
                
                events.push({
                    id: assignment.libraryId,
                    title: assignment.title,
                    date: dueDate,
                    type: 'assignment',
                    status: status,
                    points: assignment.points,
                    gradeCategory: assignment.gradeCategory,
                    isOverdue: isOverdue(dueDate),
                    isDueToday: isDueToday(dueDate),
                    isUpcoming: isUpcoming(dueDate),
                    daysUntilDue: getDaysUntilDue(dueDate)
                });
            }
        }
    });
    
    return events.sort((a, b) => a.date - b.date);
}

/**
 * Get assignments by status
 * @param {Array} assignments - Array of assignments with submissions
 * @param {string} status - Status to filter by
 * @returns {Array} - Filtered assignments
 */
function getAssignmentsByStatus(assignments, status) {
    return assignments.filter(assignment => {
        const assignmentStatus = getSubmissionStatus(assignment, assignment.submission);
        return assignmentStatus === status;
    });
}

/**
 * Get upcoming assignments (due in next 7 days)
 * @param {Array} assignments - Array of assignments
 * @returns {Array} - Upcoming assignments
 */
function getUpcomingAssignments(assignments) {
    return assignments.filter(assignment => {
        return assignment.dueDate && isUpcoming(assignment.dueDate);
    });
}

/**
 * Get overdue assignments
 * @param {Array} assignments - Array of assignments with submissions
 * @returns {Array} - Overdue assignments
 */
function getOverdueAssignments(assignments) {
    return assignments.filter(assignment => {
        return assignment.dueDate && 
               isOverdue(assignment.dueDate) && 
               !assignment.submission;
    });
}

/**
 * Get assignments due today
 * @param {Array} assignments - Array of assignments
 * @returns {Array} - Assignments due today
 */
function getAssignmentsDueToday(assignments) {
    return assignments.filter(assignment => {
        return assignment.dueDate && isDueToday(assignment.dueDate);
    });
}

/**
 * Format due date for display
 * @param {Date} dueDate - Due date
 * @returns {string} - Formatted date string
 */
function formatDueDate(dueDate) {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = getDaysUntilDue(dueDate);
    
    if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays > 1) {
        return `Due in ${diffDays} days`;
    } else if (diffDays === -1) {
        return 'Due yesterday';
    } else {
        return `Overdue by ${Math.abs(diffDays)} days`;
    }
}

module.exports = {
    isDueToday,
    isOverdue,
    isUpcoming,
    getSubmissionStatus,
    isSubmissionAllowed,
    getDaysUntilDue,
    getCalendarEvents,
    getAssignmentsByStatus,
    getUpcomingAssignments,
    getOverdueAssignments,
    getAssignmentsDueToday,
    formatDueDate
};
