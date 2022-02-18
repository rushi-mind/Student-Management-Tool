// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-student');
const express = require('express');
var path = require('path');
const multer = require('multer');

// Importing route controllers
const changePassword = require('../controllers/student/change-password');
const getAssignments = require('../controllers/student/get-assignments');
const getAttendance = require('../controllers/student/get-attendance');
const getProfile = require('../controllers/student/get-profile');
const leaveApplication = require('../controllers/student/leave-application');
const editProfileImage = require('../controllers/student/edit-profile-image');
const deleteProfileImage = require('../controllers/student/delete-profile-image');
const login = require('../controllers/student/login');

// -------------------------------------------------------------------------------------------------------------
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profile-images/students/');
    },
    filename: (req, file, cb) => {
        cb(null, (req.student.rollNo).toString() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// -------------------------------------------------------------------------------------------------------------
router.get('/get-profile/:rollNo', auth, getProfile);
router.put('/edit-profile-image/:rollNo', [auth, upload.single('image')], editProfileImage);
router.put('/change-password/:rollNo', auth, changePassword);
router.delete('/delete-profile-image/:rollNo', auth, deleteProfileImage);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-assignments/:rollNo', auth, getAssignments);

// -------------------------------------------------------------------------------------------------------------
router.post('/leave-application', auth, leaveApplication);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-attendance', auth, getAttendance);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', login);

module.exports = router;