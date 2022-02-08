const router = require('express').Router();

const adminRouter = require('./admin');
const studentRouter = require('./student');

router.use('/api/admin', adminRouter);
router.use('/api/student', studentRouter);

module.exports = router;