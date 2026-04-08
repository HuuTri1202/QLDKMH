const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  // Thông tin cơ bản
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
  description: {
    type: String,
    trim: true,
  },

  // Thông tin chi tiết
  credits: {
    type: Number,
    required: [true, "Số tín chỉ là bắt buộc"],
    min: [1, "Tối thiểu 1 tín chỉ"],
    max: [4, "Tối đa 4 tín chỉ"],
  },

  // Giảng viên
  instructor: {
    type: String,
    required: [true, "Giảng viên là bắt buộc"],
    trim: true,
  },
  instructorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // Lịch học
  schedule: {
    dayOfWeek: {
      type: String,
      enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      required: true,
    },
    startTime: {
      type: String, // format: "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // format: "HH:mm"
      required: true,
    },
    location: {
      type: String,
      required: [true, "Địa điểm học là bắt buộc"],
      trim: true,
    },
  },

  // Sức chứa
  maxCapacity: {
    type: Number,
    required: [true, "Sức chứa tối đa là bắt buộc"],
    min: [1, "Tối thiểu 1 học viên"],
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Kỳ học
  semester: {
    type: String,
    required: [true, "Kỳ học là bắt buộc"],
    enum: ["HK1", "HK2", "HK3", "Hè"],
    trim: true,
  },
  academicYear: {
    type: String,
    required: [true, "Năm học là bắt buộc"],
    trim: true,
  },

  // Điều kiện tiên quyết
  prerequisites: [
    {
      type: String,
      trim: true,
    },
  ],

  // Trạng thái
  status: {
    type: String,
    enum: ["Mở", "Đóng", "Hủy", "Chờ duyệt"],
    default: "Mở",
  },
  isFull: {
    type: Boolean,
    default: false,
  },

  // Thông tin bổ sung
  department: {
    type: String,
    required: true,
    trim: true,
  },

  courseType: {
    type: String,
    enum: ["Lý thuyết", "Thực hành", "Lý thuyết + Thực hành"],
    default: "Lý thuyết",
  },

  // Ngày bắt đầu - kết thúc
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware: Cập nhật isFull
courseSchema.pre("save", function (next) {
  this.isFull = this.currentEnrollment >= this.maxCapacity;
  this.updatedAt = Date.now();
  next();
});

// Phương thức: Kiểm tra còn chỗ trống
courseSchema.methods.hasAvailableSlots = function () {
  return this.currentEnrollment < this.maxCapacity;
};

// Phương thức: Đăng kí học
courseSchema.methods.enrollStudent = function () {
  if (!this.hasAvailableSlots()) {
    throw new Error("Môn học đã đầy, không thể đăng kí thêm");
  }
  this.currentEnrollment += 1;
  return this.save();
};

// Phương thức: Hủy đăng kí
courseSchema.methods.unenrollStudent = function () {
  if (this.currentEnrollment > 0) {
    this.currentEnrollment -= 1;
  }
  return this.save();
};

// Phương thức: Lấy thông tin lịch học
courseSchema.methods.getScheduleInfo = function () {
  return {
    dayOfWeek: this.schedule.dayOfWeek,
    time: `${this.schedule.startTime} - ${this.schedule.endTime}`,
    location: this.schedule.location,
  };
};

// Phương thức: Kiểm tra có thể đăng kí hay không
courseSchema.methods.canEnroll = function () {
  return this.status === "Mở" && this.hasAvailableSlots();
};

// Phương thức tĩnh: Lấy tất cả môn học của một khoa
courseSchema.statics.findByDepartment = function (department) {
  return this.find({ department: department });
};

// Phương thức tĩnh: Lấy môn học theo kỳ học
courseSchema.statics.findBySemester = function (semester, academicYear) {
  return this.find({ semester: semester, academicYear: academicYear });
};

// Phương thức tĩnh: Lấy môn học còn chỗ trống
courseSchema.statics.findAvailableCourses = function () {
  return this.find({ status: "Mở", isFull: false });
};

// Index
courseSchema.index({ courseCode: 1, academicYear: 1, semester: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
