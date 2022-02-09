const router = require('express').Router();
const auth = require('../middlewares/auth-admin');

const addStudent = require('../controllers/admin/add-student');
const editStudent = require('../controllers/admin/edit-student');
const addAssignment = require('../controllers/admin/add-assignment');
const editAssignment = require('../controllers/admin/edit-assignment');
const deleteStudent = require('../controllers/admin/delete-student');
const checkAttendance = require('../controllers/admin/check-attendance');
const addTimetable = require('../controllers/admin/add-timetable');
const editTimetable = require('../controllers/admin/edit-timetable');
const viewStudent = require('../controllers/admin/view-student');
const attendance = require('../controllers/admin/attendance');
const login = require('../controllers/admin/login');

router.post('/add-student', auth, addStudent);
router.put('/edit-student', auth, editStudent);
router.post('/add-assignment', auth, addAssignment);
router.put('/edit-assignment', auth, editAssignment);
router.delete('/delete-student', auth, deleteStudent);
router.get('/check-attendance', auth, checkAttendance);
router.post('/add-timetable', auth, addTimetable);
router.put('/edit-timetable', auth, editTimetable);
router.get('/view-student', auth, viewStudent);
router.post('/attendance', auth, attendance);
router.post('/login', login);

module.exports = router;