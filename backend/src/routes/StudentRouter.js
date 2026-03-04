const express = require("express");
const StudentController = require("../controllers/StudentController");

const router = express.Router();

router.get("/", StudentController.getAllStudents);
router.post("/", StudentController.createStudent);
router.put("/:id", StudentController.updateStudent);
router.delete("/:id", StudentController.deleteStudent);

module.exports = router;