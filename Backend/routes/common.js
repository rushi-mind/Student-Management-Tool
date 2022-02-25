// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth');

// Importing route controllers
const getEvents = require('../controllers/common/getEvents');
const getTimetable = require('../controllers/common/getTimetable');
const getAssignments = require('../controllers/common/getAssignments');

// -------------------------------------------------------------------------------------------------------------
router.get('/get-events', auth, getEvents);
router.get('/get-timetable/:departmentId/:semester', auth, getTimetable);
router.get('/get-assignments/:departmentId/:semester', auth, getAssignments);

module.exports = router;