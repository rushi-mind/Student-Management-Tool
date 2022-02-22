// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-admin');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const bodyParser = require('body-parser');

let upload = multer();
let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });


// Importing route controllers
const addStudent = require('../controllers/admin/add-student');
const editStudent = require('../controllers/admin/edit-student');
const addAssignment = require('../controllers/admin/add-assignment');
const editAssignment = require('../controllers/admin/edit-assignment');
const deleteStudent = require('../controllers/admin/delete-student');
const checkAttendance = require('../controllers/admin/check-attendance');
const addTimetable = require('../controllers/admin/add-timetable');
const editTimetable = require('../controllers/admin/edit-timetable');
const getStudents = require('../controllers/admin/get-students');
const attendance = require('../controllers/admin/attendance');
const getStudent = require('../controllers/admin/get-student');
const addEvent = require('../controllers/admin/add-event');
const deleteEvent = require('../controllers/admin/delete-event');
const deleteAssignment = require('../controllers/admin/delete-assignment');
const addTeacher = require('../controllers/admin/add-teacher');
const editTeacher = require('../controllers/admin/edit-teacher');
const deleteTeacher = require('../controllers/admin/delete-teacher');
const addDepartment = require('../controllers/admin/add-department');
const getDepartments = require('../controllers/admin/get-departments');
const deleteDepartment = require('../controllers/admin/delete-department');
const getTeachers = require('../controllers/admin/get-teachers');
const getTeacher = require('../controllers/admin/get-teacher');
const login = require('../controllers/admin/login');


// -------------------------------------------------------------------------------------------------------------
let assignmetnFileSotrage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assignments/');
    },
    filename: async (req, file, cb) => {
        if((req.url).includes('/add-assignment')) {
            let fileName = ``;
            try{ 
                let total = (await db.sequelize.query(`select count(id) as total from assignments where semester = ${req.params.semester} and departmentId = ${req.params.departmentId};`))[0][0]['total'];
                fileName = `${req.params.departmentId}-${req.params.semester}-${total+1}`;
            } catch {
                fileName = `temp`;
            }
            cb(null, `${fileName}${path.extname(file.originalname)}`);
        }
        else {
            let fileName = null;
            try {
                fileName = (await db.sequelize.query(`select filePath from assignments where id = ${req.params.id};`))[0][0]['filePath'];
            } catch (error) {
                fileName = `${req.params.id}-temp.pdf`;
            }
            cb(null, `${fileName}`);
        }
    }
});
const uploadAssignmentFile = multer({ storage: assignmetnFileSotrage });

// -------------------------------------------------------------------------------------------------------------
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
});
const uploadEventImage = multer({ storage: eventImageStorage });


// -------------------------------------------------------------------------------------------------------------
router.post('/add-student', [ auth, jsonParser ], addStudent);
router.put('/edit-student/:rollNo', [ auth, jsonParser ], editStudent);
router.get('/get-students/:departmentId/:semester', auth, getStudents);
router.get('/get-student/:rollNo', auth, getStudent);
router.delete('/delete-student/:rollNo', auth, deleteStudent);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-teacher', [ auth, jsonParser ], addTeacher);
router.put('/edit-teacher/:adminId', [ auth, jsonParser ], editTeacher);
router.delete('/delete-teacher/:id', auth, deleteTeacher);
router.get('/get-teachers/:departmentId', auth, getTeachers);
router.get('/get-teacher/:adminId', auth, getTeacher);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-department', [ auth, upload.array() ], addDepartment);
router.get('/get-departments', auth, getDepartments);
router.delete('/delete-department/:id', auth, deleteDepartment);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-assignment/:departmentId/:semester', [ auth, uploadAssignmentFile.single('file') ], addAssignment);
router.put('/edit-assignment/:id', [ auth, uploadAssignmentFile.single('file') ], editAssignment);
router.delete('/delete-assignment/:id', auth, deleteAssignment);

// -------------------------------------------------------------------------------------------------------------
router.post('/attendance', [ auth, jsonParser ], attendance);
router.get('/check-attendance/:departmentId/:semester', auth, checkAttendance);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-timetable', [ auth, jsonParser ], addTimetable);
router.put('/edit-timetable/:departmentId/:semester', auth, editTimetable);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-event', [ auth, uploadEventImage.single('image') ], addEvent);
router.delete('/delete-event/:id', auth, deleteEvent);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', [ urlencodedParser ], login);

module.exports = router;