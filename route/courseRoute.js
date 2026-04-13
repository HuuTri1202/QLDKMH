const express = require('express');
const router = express.Router();
const Course = require('../models/course');

// ================== HELPER ==================
const validateCourse = (data) => {
  if (
    data.maxCapacity !== undefined &&
    data.currentEnrollment !== undefined &&
    data.currentEnrollment > data.maxCapacity
  ) {
    throw new Error("Số lượng đăng ký vượt quá sức chứa");
  }
};

const autoCloseCourse = (course) => {
  if (course.currentEnrollment >= course.maxCapacity) {
    course.status = "Đóng";
  }
};

// ================== GET ALL ==================
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== GET BY CODE ==================
router.get('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase()
    });

    if (!course) {
      return res.status(404).json({ message: 'Môn học không tồn tại' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== CREATE ==================
router.post('/', async (req, res) => {
  try {
    validateCourse(req.body);

    const course = new Course(req.body);

    autoCloseCourse(course);

    const newCourse = await course.save();

    res.status(201).json({
      message: "Tạo môn học thành công",
      data: newCourse,
    });

  } catch (error) {

    // duplicate courseCode
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã môn học đã tồn tại" });
    }

    res.status(400).json({ message: error.message });
  }
});

// ================== UPDATE ==================
router.put('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase()
    });

    if (!course) {
      return res.status(404).json({ message: 'Môn học không tồn tại' });
    }

    // merge data
    Object.assign(course, req.body);

    validateCourse(course);

    autoCloseCourse(course);

    const updatedCourse = await course.save(); // ✅ có validate luôn

    res.json(updatedCourse);

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã môn học đã tồn tại" });
    }

    res.status(400).json({ message: error.message });
  }
});

// ================== DELETE ==================
router.delete('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      courseCode: req.params.courseCode.toUpperCase()
    });

    if (!course) {
      return res.status(404).json({ message: 'Môn học không tồn tại' });
    }

    res.json({ message: 'Môn học đã được xóa' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;