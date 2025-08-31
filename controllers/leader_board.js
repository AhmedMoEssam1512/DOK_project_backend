const sequelize = require('../config/database');
const student = require('../data_link/student_data_link');
const asyncWrapper = require('../middleware/asyncwrapper');

const leaderBoard = asyncWrapper(async (req, res, next) => {
    /* 
        http://DOK.com/leaderBoard/?page=1
        every page will render 20 students
    */
  
    try{

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit; 


    const result = await student.showLeaderBoard(limit,offset);

    const totalStudents = await student.getTotalNumberOfStudents();
    const totalPages = Math.ceil(totalStudents / limit);

    res.json({
      currentPage: page,
      totalPages,
      totalStudents,
      leaderboard: result.rows,
    });


  }
  catch{
    console.error(err.message);
    res.status(500).send("Server error");
  }

  
});

module.exports = { leaderBoard };