const StudentModel = require("../models/StudentModel");

const StudentController = {
  getAllStudents: async (req, res) => {
    const students = await StudentModel.findAll();
    res.json(students);
  },
  createStudent: async (req, res) => {
    const { firstName, lastName, course, yearLevel } = req.body;
    const exist = await StudentModel.findOne({ where: { firstName, lastName } });
    if (exist) {
      return res.status(400).json({ error: "Student already exists" });
    }
    const student = await StudentModel.create({ firstName, lastName, course, yearLevel });
    res.json(student);
  },
  updateStudent: async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, course, yearLevel } = req.body;
    const student = await StudentModel.update({ firstName, lastName, course, yearLevel }, { where: { id } });
    res.json(student);
  },
  deleteStudent: async (req, res) => {
    const { id } = req.params;
    await StudentModel.destroy({ where: { id } });
    res.json({ message: "Student deleted successfully" });
  },
};

module.exports = StudentController;