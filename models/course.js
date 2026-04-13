const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Lý thuyết", "Thực hành"],
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: [/^\d{2}:\d{2}$/, "Sai format HH:mm"],
  },
  endTime: {
    type: String,
    required: true,
    match: [/^\d{2}:\d{2}$/, "Sai format HH:mm"],
  },
  location: {
    type: String,
    required: true,
  },
});

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Mã môn học là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    courseName: {
      type: String,
      required: [true, "Tên môn học là bắt buộc"],
      trim: true,
    },

    instructor: {
      type: String,
      required: [true, "Giảng viên là bắt buộc"],
      trim: true,
    },

    schedule: [scheduleSchema],

    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Mở", "Đóng", "Hủy"],
      default: "Mở",
    },

    courseType: {
      type: String,
      enum: ["Lý thuyết", "Thực hành", "Lý thuyết + Thực hành"],
      default: "Lý thuyết",
    },
  },
  { timestamps: true } //  FIX timestamps chuẩn
);

//  Index tối ưu
courseSchema.index({ courseCode: 1 });

module.exports = mongoose.model("Course", courseSchema);