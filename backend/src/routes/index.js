const express = require("express");
const StudentRouter = require("./StudentRouter");
const CourseRouter = require("./CourseRouter");

const router = express.Router();

router.use("/students", StudentRouter);
router.use("/courses", CourseRouter);

module.exports = router;