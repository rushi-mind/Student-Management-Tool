const router = require('express').Router();

const adminRouter = require('./admin');
const studentRouter = require('./student');

if(!process.env.jwtPrivateKey) {
    console.log('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

router.use('/api/admin', adminRouter);
router.use('/api/student', studentRouter);

module.exports = router;