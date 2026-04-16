const express = require("express");
const router = express.Router();
const Enrollment = require("../models/enrollments");
const Course = require("../models/course");
const Student = require("../models/student");

// GET /enrollments - Lấy đăng ký theo query hoặc tất cả
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) {
      filter.student = req.query.studentId;
    }
    const enrollments = await Enrollment.find(filter)
      .populate("student")
      .populate("course");
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /enrollments/all - Lấy tất cả đăng ký
router.get("/all", async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student")
      .populate("course");
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /enrollments/:id - Lấy đăng ký theo ID
router.get("/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student")
      .populate("course");
    if (!enrollment)
      return res.status(404).json({ message: "Đăng ký không tồn tại" });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createEnrollment = async (req, res) => {
  try {
    const { student, course } = req.body;

    // Kiểm tra sinh viên tồn tại
    const studentData = await Student.findById(student);
    if (!studentData) throw new Error("Sinh viên không tồn tại");

    // Kiểm tra môn học tồn tại và còn chỗ
    const courseData = await Course.findById(course);
    if (!courseData) throw new Error("Môn học không tồn tại");
    if (courseData.currentEnrollment >= courseData.maxCapacity) {
      throw new Error("Môn học đã hết chỗ");
    }

    // Kiểm tra đăng ký trùng
    const existing = await Enrollment.findOne({ student, course });
    if (existing) throw new Error("Sinh viên đã đăng ký môn này");

    // Tạo đăng ký mới
    const enrollment = new Enrollment(req.body);
    await enrollment.save();

    // Tăng sỉ số
    courseData.currentEnrollment += 1;
    await courseData.save();

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.post("/", createEnrollment);
router.post("/create", createEnrollment);

// PUT /enrollments/:id - Cập nhật đăng ký
router.put("/update/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!enrollment)
      return res.status(404).json({ message: "Đăng ký không tồn tại" });
    res.json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) throw new Error("Đăng ký không tồn tại");

    // Giảm sỉ số của môn học
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);
      await course.save();
    }

    await enrollment.deleteOne();
    res.json({ message: "Đăng ký đã được xóa" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

router.delete("/:id", deleteEnrollment);
router.delete("/delete/:id", deleteEnrollment);

module.exports = router;
