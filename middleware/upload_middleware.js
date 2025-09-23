const multer = require('multer');
const path = require('path');

// Configure multer for PDF uploads (Admin)
const adminStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/pdfs');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const timestamp = Date.now();
        const fileName = `admin_${timestamp}_${file.originalname}`;
        cb(null, fileName);
    }
});

// Configure multer for student submissions
const submissionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/submissions');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with student ID
        const timestamp = Date.now();
        const studentId = req.student ? req.student.id : 'unknown';
        const fileName = `submission_${studentId}_${timestamp}_${file.originalname}`;
        cb(null, fileName);
    }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Configure multer for admin uploads
const adminUpload = multer({
    storage: adminStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Configure multer for student submissions
const submissionUpload = multer({
    storage: submissionStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware for single PDF upload (Admin)
const uploadSinglePDF = adminUpload.single('pdf');

// Middleware for student submission upload
const uploadSubmission = submissionUpload.single('pdf');

// Middleware wrapper to handle multer errors (Admin)
const handleUpload = (req, res, next) => {
    uploadSinglePDF(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: "error",
                    message: "File size must be less than 10MB"
                });
            }
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        } else if (err) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        next();
    });
};

// Middleware wrapper to handle student submission uploads
const handleSubmissionUpload = (req, res, next) => {
    uploadSubmission(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    status: "error",
                    message: "File size must be less than 10MB"
                });
            }
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        } else if (err) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        next();
    });
};

module.exports = {
    handleUpload,
    handleSubmissionUpload,
    upload: adminUpload,
    submissionUpload
};
