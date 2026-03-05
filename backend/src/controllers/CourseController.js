const CourseModel = require("../models/CourseModel");

const CourseController = {
  getAllCourses: async (req, res) => {
    const courses = await CourseModel.findAll({ order: [["code", "ASC"]] });
    res.json(courses);
  },

  createCourse: async (req, res) => {
    const { code, name, isActive } = req.body;
    const c = String(code || "").trim().toUpperCase();
    const n = String(name || "").trim();
    if (!c || !n) {
      return res.status(400).json({ error: "code and name are required" });
    }

    const existing = await CourseModel.findOne({ where: { code: c } });
    if (existing) {
      return res.status(400).json({ error: "Course code already exists" });
    }

    const created = await CourseModel.create({
      code: c,
      name: n,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });
    res.status(201).json(created);
  },

  updateCourse: async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    const { code, name, isActive } = req.body;
    const course = await CourseModel.findByPk(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const next = {};
    if (code !== undefined) next.code = String(code || "").trim().toUpperCase();
    if (name !== undefined) next.name = String(name || "").trim();
    if (isActive !== undefined) next.isActive = Boolean(isActive);

    if (next.code !== undefined && !next.code) {
      return res.status(400).json({ error: "code cannot be empty" });
    }
    if (next.name !== undefined && !next.name) {
      return res.status(400).json({ error: "name cannot be empty" });
    }

    // If changing code, ensure uniqueness
    if (next.code && next.code !== course.code) {
      const existing = await CourseModel.findOne({ where: { code: next.code } });
      if (existing) {
        return res.status(400).json({ error: "Course code already exists" });
      }
    }

    await course.update(next);
    res.json(course);
  },

  deleteCourse: async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    const deleted = await CourseModel.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(204).send();
  },
};

module.exports = CourseController;

