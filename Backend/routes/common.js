// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth');

// Importing route controllers
const getEvents = require('../controllers/common/get-events');
const getTimetable = require('../controllers/common/get-timetable');

// -------------------------------------------------------------------------------------------------------------
router.get('/get-events', auth, getEvents);
router.get('/get-timetable/:departmentId/:semester', auth, getTimetable);

module.exports = router;