const router = require('express').Router();
const auth = require('../middlewares/auth-student');
const express = require('express');
var path = require('path');
const multer = require('multer');

const changePassword = require('../controllers/student/change-password');
const getAssignments = require('../controllers/student/get-assignments');
const getAttendance = require('../controllers/student/get-attendance');
const getProfile = require('../controllers/student/get-profile');
const getTimetable = require('../controllers/student/get-timetable');
const leaveApplication = require('../controllers/student/leave-application');
const editProfileImage = require('../controllers/student/edit-profile-image');
const deleteProfileImage = require('../controllers/student/delete-profile-image');
const login = require('../controllers/student/login');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profile-images/students/');
    },
    filename: (req, file, cb) => {
        cb(null, (req.student.rollNo).toString() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.put('/change-password', auth, changePassword);
router.get('/get-assignments', auth, getAssignments);
router.get('/get-attendance', auth, getAttendance);
router.get('/get-profile', auth, getProfile);
router.get('/get-timetable', auth, getTimetable);
router.post('/leave-application', auth, leaveApplication);
router.post('/edit-profile-image', [auth, upload.single('image')], editProfileImage);
router.post('/delete-profile-image', auth, deleteProfileImage);
router.post('/login', login);

module.exports = router;