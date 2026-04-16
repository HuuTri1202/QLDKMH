const express = require("express");
const Student = require("../models/student");
const router = express.Router();

// GET / - Lấy tất cả sinh viên
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / - Tạo sinh viên mới (thêm mới)
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
