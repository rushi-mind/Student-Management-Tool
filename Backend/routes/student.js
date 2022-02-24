// Importing required dependencies and files
const router = require('express').Router();
const auth = require('../middlewares/auth-student');
var path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// Importing route controllers
const { getProfile, editProfileImage, deleteProfileImage } = require('../controllers/student/profileController');
const getAttendance = require('../controllers/student/attendanceController');
const leaveApplication = require('../controllers/student/leaveApplicationController');
const { login, changePassword } = require('../controllers/student/auth');

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
router.delete('/delete-profile-image/:rollNo', auth, deleteProfileImage);

// -------------------------------------------------------------------------------------------------------------
router.post('/leave-application', [ auth, jsonParser ], leaveApplication);

// -------------------------------------------------------------------------------------------------------------
router.get('/get-attendance', auth, getAttendance);

// -------------------------------------------------------------------------------------------------------------
router.post('/login', [ urlencodedParser ], login);

module.exports = router;