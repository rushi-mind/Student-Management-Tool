const router = require('express').Router();
const auth = require('../middlewares/auth-student');

const changePassword = require('../controllers/student/change-password');
const getAssignments = require('../controllers/student/get-assignments');
const getAttendance = require('../controllers/student/get-attendance');
const getProfile = require('../controllers/student/get-profile');
const getTimetable = require('../controllers/student/get-timetable');
const leaveApplication = require('../controllers/student/leave-application');
const editProfileImage = require('../controllers/student/edit-profile-image');
const login = require('../controllers/student/login');

router.put('/change-password', auth, changePassword);
router.get('/get-assignments', auth, getAssignments);
router.get('/get-attendance', auth, getAttendance);
router.get('/get-profile', auth, getProfile);
router.get('/get-timetable', auth, getTimetable);
router.post('/leave-application', auth, leaveApplication);
router.post('/edit-profile-image', auth, editProfileImage);
router.post('/login', login);

module.exports = router;