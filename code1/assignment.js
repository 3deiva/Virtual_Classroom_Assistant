const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
  assignmentName: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  staffName: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
