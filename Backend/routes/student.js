// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-student');
let path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

let jsonParser = bodyParser.json();
let upload = multer();

// Importing route controllers
const { getProfile, editProfileImage, deleteProfileImage } = require('../controllers/student/profileController');
const getAttendance = require('../controllers/student/attendanceController');
const { applyForLeave, getApplications } = require('../controllers/student/leaveApplicationController');
const { login, changePassword } = require('../controllers/student/authController');

// -------------------------------------------------------------------------------------------------------------
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profile-images/students/');
    },
    filename: (req, file, cb) => {
        cb(null, (req.student.rollNo).toString() + path.extname(file.originalname));
    }
});
const uploadImage = multer({ storage });


// -------------------------------------------------------------------------------------------------------------
router.get('/get-profile/:rollNo', auth, getProfile);
router.put('/edit-profile-image', [ auth, uploadImage.single('image') ], editProfileImage);
router.put('/change-password/:rollNo', [ auth, jsonParser ], changePassword);
router.delete('/delete-profile-image', auth, deleteProfileImage);

// -------------------------------------------------------------------------------------------------------------
router.post('/leave-application', [ auth, jsonParser ], applyForLeave);
router.get('/get-applications/:filter', [ auth ], getApplications);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-attendance', auth, getAttendance);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', [ upload.array() ], login);

module.exports = router;