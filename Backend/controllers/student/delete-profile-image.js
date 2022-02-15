const db = require('../../models');

module.exports = (async (req, res) => {

    let pass = true;
    try {
        db.sequelize.query(`update students set profileImagepath = null where rollNo = ${req.student.rollNo};`);
    } catch (error) {
        pass = false;
        console.log(error);
    }
    if(!pass) return res.status(400).send('Something went wrong. Please try again.');
    res.send({status: 'ok', message: 'Profile picture deleted successfully'});
});