const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  major: { type: String, required: true },
});

module.exports = mongoose.model("Student", studentSchema);
