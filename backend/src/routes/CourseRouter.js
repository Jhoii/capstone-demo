const express = require("express");
const CourseController = require("../controllers/CourseController");

const router = express.Router();

router.get("/", CourseController.getAllCourses);
router.post("/", CourseController.createCourse);
router.put("/:id", CourseController.updateCourse);
router.delete("/:id", CourseController.deleteCourse);

module.exports = router;

