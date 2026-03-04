const StudentModel = require("../models/StudentModel");

const StudentController = {
  getAllStudents: async (req, res) => {
    const students = await StudentModel.findAll({ order: [["id", "DESC"]] });
    res.json(students);
  },
  createStudent: async (req, res) => {
    const { firstName, lastName, course, yearLevel } = req.body;
    if (!firstName || !lastName || !course) {
      return res.status(400).json({ error: "firstName, lastName, and course are required" });
    }
    const exist = await StudentModel.findOne({ where: { firstName, lastName } });
    if (exist) {
      return res.status(400).json({ error: "Student already exists" });
    }
    const student = await StudentModel.create({
      firstName,
      lastName,
      course,
      yearLevel: Number(yearLevel || 1),
    });
    res.status(201).json(student);
  },
  updateStudent: async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, course, yearLevel } = req.body;
    if (!firstName || !lastName || !course) {
      return res.status(400).json({ error: "firstName, lastName, and course are required" });
    }
    const student = await StudentModel.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    await student.update({
      firstName,
      lastName,
      course,
      yearLevel: Number(yearLevel || 1),
    });
    res.json(student);
  },
  deleteStudent: async (req, res) => {
    const { id } = req.params;
    const deleted = await StudentModel.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(204).send();
  },
};

module.exports = StudentController;