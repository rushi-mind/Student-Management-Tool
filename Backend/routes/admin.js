// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-admin');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const express = require('express');

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
const getTeachers = require('../controllers/admin/get-teachers');
const editTeacher = require('../controllers/admin/edit-teacher');
const deleteTeacher = require('../controllers/admin/delete-teacher');
const login = require('../controllers/admin/login');


// -------------------------------------------------------------------------------------------------------------
let assignmetnFileSotrage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assignments/');
    },
    filename: async (req, file, cb) => {
        if(!req.params) {
            let id = 0;
            try{ 
                id = (await db.sequelize.query(`select id from assignments order by id desc limit 1`))[0][0];
            } catch {}
            if(id) id = id.id;
            cb(null, `${parseInt(id) + 1}${path.extname(file.originalname)}`);
        }
        else if(req.params) {
            cb(null, `${req.params.id}${path.extname(file.originalname)}`);
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
router.post('/add-student', auth, addStudent);
router.put('/edit-student/:rollNo', auth, editStudent);
router.get('/get-students/:departmentId/:semester', auth, getStudents);
router.get('/get-student/:rollNo', auth, getStudent);
router.delete('/delete-student/:rollNo', auth, deleteStudent);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-teacher', auth, addTeacher);
router.get('/get-teachers', auth, getTeachers);
router.put('/edit-teacher/:id', auth, editTeacher);
router.delete('/delete-teacher/:id', auth, deleteTeacher);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-assignment', [ auth, uploadAssignmentFile.single('file') ], addAssignment);
router.put('/edit-assignment/:id', [ auth, uploadAssignmentFile.single('file') ], editAssignment);
router.delete('/delete-assignment/:id', auth, deleteAssignment);

// -------------------------------------------------------------------------------------------------------------
router.post('/attendance', auth, attendance);
router.get('/check-attendance/:departmentId/:semester', auth, checkAttendance);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-timetable', auth, addTimetable);
router.put('/edit-timetable/:departmentId/:semester', auth, editTimetable);

// -------------------------------------------------------------------------------------------------------------
router.post('/add-event', [ auth, uploadEventImage.single('image') ], addEvent);
router.delete('/delete-event/:id', auth, deleteEvent);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', login);

module.exports = router;