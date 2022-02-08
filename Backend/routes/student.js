const router = require('express').Router();

const changePassword = require('../controllers/student/change-password');
const getAssignments = require('../controllers/student/get-assignments');
const getAttendance = require('../controllers/student/get-attendance');
const getProfile = require('../controllers/student/get-profile');
const getTimetable = require('../controllers/student/get-timetable');
const leaveApplication = require('../controllers/student/leave-application');
const login = require('../controllers/student/login');
const logout = require('../controllers/student/logout');

router.put('/change-password', changePassword);
router.get('/get-assignments', getAssignments);
router.get('/get-attendance', getAttendance);
router.get('/get-profile', getProfile);
router.get('/get-timetable', getTimetable);
router.post('/leave-application', leaveApplication);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;