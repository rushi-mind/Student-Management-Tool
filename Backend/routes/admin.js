// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-admin');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const bodyParser = require('body-parser');

let upload = multer();
let jsonParser = bodyParser.json();

// Importing route controllers
const { addStudent, editStudent, getStudents, getStudent, deleteStudent } = require('../controllers/admin/studentsController');
const { addTeacher, editTeacher, getTeacher, getTeachers, deleteTeacher } = require('../controllers/admin/teachersController');
const { getStudentsList, fillAttendance, checkAttendance } = require('../controllers/admin/attendanceController');
const { addDepartment, getDepartments, deleteDepartment } = require('../controllers/admin/departmentsController');
const { addAssignment, editAssignment, getAssignment, deleteAssignment } = require('../controllers/admin/assignmentsController');
const { getApplications, approveOrRejectApplications } = require('../controllers/admin/leavesController');
const { addTimetable, editTimetable } = require('../controllers/admin/timetablesController');
const { addEvent, deleteEvent } = require('../controllers/admin/eventsController');
const { login, changePassword } = require('../controllers/admin/authController');

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
                if(fileName) fileName = fileName.split('/')[fileName.split('/').length  - 1];
                else {
                    let temp = (await db.sequelize.query(`select semester, departmentId from assignments where id = ${req.params.id};`))[0][0];
                    let total = (await db.sequelize.query(`select count(id) as total from assignments where semester = ${temp.semester} and departmentId = ${temp.departmentId};`))[0][0]['total'];
                    fileName = `${temp.departmentId}-${temp.semester}-${total+1}${path.extname(file.originalname)}`;
                }
            } catch (error) {
                console.log(error);
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
        if(!id) id = 0;
        cb(null, `event-${parseInt(id) + 1}${path.extname(file.originalname)}`);
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
router.delete('/delete-teacher/:adminId', auth, deleteTeacher);
router.get('/get-teachers/:departmentId', auth, getTeachers);
router.get('/get-teacher/:adminId', auth, getTeacher);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-department', [ auth, upload.array() ], addDepartment);
router.get('/get-departments', auth, getDepartments);
router.delete('/delete-department/:id', auth, deleteDepartment);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-assignment/:departmentId/:semester', [ auth, uploadAssignmentFile.single('file') ], addAssignment);
router.put('/edit-assignment/:id', [ auth, uploadAssignmentFile.single('file') ], editAssignment);
router.get('/get-assignment/:id', auth, getAssignment);
router.delete('/delete-assignment/:id', auth, deleteAssignment);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-students-list/:departmentId/:semester', auth, getStudentsList);
router.post('/fill-attendance', [ auth, jsonParser ], fillAttendance);
router.get('/check-attendance/:departmentId/:semester', auth, checkAttendance);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-applications/:filter', [ auth ], getApplications);
router.post('/approve-reject-applications', [ auth, jsonParser ], approveOrRejectApplications);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-timetable', [ auth, jsonParser ], addTimetable);
router.put('/edit-timetable/:departmentId/:semester', [ auth, jsonParser ], editTimetable);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-event', [ auth, uploadEventImage.single('image') ], addEvent);
router.delete('/delete-event/:id', auth, deleteEvent);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', [ upload.array() ], login);
router.put('/change-password', [ auth, jsonParser ], changePassword);

module.exports = router;