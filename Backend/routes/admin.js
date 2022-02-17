const router = require('express').Router();
const auth = require('../middlewares/auth-admin');
const multer = require('multer');
const path = require('path');
const db = require('../models');

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
const getAllStudents = require('../controllers/admin/get-all-students');
const getStudent = require('../controllers/admin/get-student');
const addEvent = require('../controllers/admin/add-event');
const login = require('../controllers/admin/login');

let assignmetnFileSotrage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assignments/');
    },
    filename: async (req, file, cb) => {
        if(req.url === '/add-assignment') {
            let id = 0;
            try{ 
                id = (await db.sequelize.query(`select id from assignments order by id desc limit 1`))[0][0];
            } catch {}
            if(id) id = id.id;
            cb(null, `${parseInt(id) + 1}${path.extname(file.originalname)}`);
        }
        else if(req.url === '/edit-assignment') {
            cb(null, `${req.body.id}${path.extname(file.originalname)}`);
        }
    }
});

let eventImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/event-images');
    },
    filename: async (req, file, cb) => {
        let id = 0;
        try {
            id = (await db.sequelize.query(`select id from events order by id desc limit 1`))[0][0];
        } catch (error) {}
        if(id) id = id.id;
        cb(null, `${parseInt(id) + 1}${path.extname(file.originalname)}`);
    }
})

const uploadAssignmentFile = multer({ storage: assignmetnFileSotrage });
const uploadEventImage = multer({ storage: eventImageStorage });

router.post('/add-student', auth, addStudent);
router.put('/edit-student', auth, editStudent);
router.post('/add-assignment', [ auth, uploadAssignmentFile.single('file') ], addAssignment);
router.put('/edit-assignment', [ auth, uploadAssignmentFile.single('file') ], editAssignment);
router.delete('/delete-student', auth, deleteStudent);
router.get('/check-attendance', auth, checkAttendance);
router.post('/add-timetable', auth, addTimetable);
router.put('/edit-timetable', auth, editTimetable);
router.get('/view-student', auth, viewStudent);
router.post('/attendance', auth, attendance);
router.get('/get-all-students', auth, getAllStudents);
router.get('/get-student', auth, getStudent);
router.post('/add-event', [ auth, uploadEventImage.single('image') ], addEvent);
router.post('/login', login);

module.exports = router;