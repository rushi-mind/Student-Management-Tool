const router = require('express').Router();
const auth = require('../middlewares/auth');

const getEvents = require('../controllers/common/get-events');
const getTimetable = require('../controllers/common/get-timetable');

router.get('/get-events', auth, getEvents);
router.get('/get-timetable', auth, getTimetable);

module.exports = router;