const router = require('express').Router();

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

router.post('/add-student', addStudent);
router.put('/edit-student', editStudent);
router.post('/add-assignment', addAssignment);
router.put('/edit-assignment', editAssignment);
router.delete('/delete-student', deleteStudent);
router.get('/check-attendance', checkAttendance);
router.post('/add-timetable', addTimetable);
router.put('/edit-timetable', editTimetable);
router.get('/view-student', viewStudent);
router.post('/attendance', attendance);

module.exports = router;