const express = require("express");
const multer = require("multer");
const path = require("path");
const Assignment = require("./assignment");
const Submission = require("./Submission");
const Student = require("./Student");
const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/assignments", async (req, res) => {
  try {
    const { assignmentName, course, staffName, deadline, password } = req.body;

    if (!assignmentName || !course || !staffName || !deadline || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(new Date(deadline))) {
      return res.status(400).json({ message: "Invalid deadline date." });
    }

    const assignment = new Assignment({
      assignmentName,
      course,
      staffName,
      deadline: new Date(deadline),
      password,
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Error creating assignment." });
  }
});

router.get("/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find();
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Error fetching assignments." });
  }
});

router.delete("/assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    res.status(200).json({ message: "Assignment deleted successfully." });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Error deleting assignment." });
  }
});

router.post("/verifyAssignmentAccess", async (req, res) => {
  const { assignmentId, password } = req.body;

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (assignment.password !== password) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    res.json({
      success: true,
      message: "Password verified",
      assignmentId: assignment._id,
    });
  } catch (error) {
    console.error("Error verifying assignment access:", error);
    res
      .status(500)
      .json({ success: false, message: "Error verifying assignment access" });
  }
});

router.post("/assignments/submit", upload.single("file"), async (req, res) => {
  try {
    const { studentName, rollNo, assignmentName, assignmentId, driveLink } =
      req.body;
    const file = req.file;

    if (
      !studentName ||
      !rollNo ||
      !assignmentName ||
      !assignmentId ||
      !driveLink
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const student = await Student.findOne({ rollNo, name: studentName });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found or details do not match.",
      });
    }

    const existingSubmission = await Submission.findOne({
      rollNo,
      assignmentId,
    });

    if (existingSubmission) {
      existingSubmission.assignmentName = assignmentName;
      existingSubmission.driveLink = driveLink;
      existingSubmission.file = file ? file.path : existingSubmission.file;
      await existingSubmission.save();
      return res
        .status(200)
        .json({ success: true, message: "Submission updated successfully." });
    } else {
      const submission = new Submission({
        studentName,
        rollNo,
        assignmentName,
        assignmentId,
        driveLink,
        file: file ? file.path : null,
      });

      await submission.save();
      return res
        .status(201)
        .json({ success: true, message: "Submission successful." });
    }
  } catch (error) {
    console.error("Error handling assignment submission:", error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting assignment." });
  }
});

router.get("/submissions/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const submissions = await Submission.find({
      assignmentId,
      verified: "pending",
    });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verifySubmission", async (req, res) => {
  const { submissionId, teacherName, rollNo } = req.body;

  try {
    const submission = await Submission.findById(submissionId);
    if (submission) {
      submission.verified = "verified";
      submission.verifiedBy = { name: teacherName, rollNo: rollNo };
      await submission.save();
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Submission not found" });
    }
  } catch (error) {
    console.error("Error verifying submission:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/rejectSubmission", async (req, res) => {
  const { submissionId, teacherName, rollNo } = req.body;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    submission.verified = "rejected";
    submission.verifiedBy = { name: teacherName, rollNo: rollNo };
    await submission.save();

    res.json({ success: true, message: "Submission rejected successfully" });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/assignments/:id", async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assignment" });
  }
});

router.get("/activeAssignments", async (req, res) => {
  try {
    const now = new Date();
    const assignments = await Assignment.find();

    const updatedAssignments = assignments.map((assignment) => {
      const deadline = new Date(assignment.deadline);
      return {
        ...assignment.toObject(),
        isClosed: now > deadline,
      };
    });

    res.status(200).json(updatedAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Error fetching assignments." });
  }
});

router.post("/verifyAndFetchSubmissions", async (req, res) => {
  const { assignmentName, password } = req.body;

  try {
    const assignment = await Assignment.findOne({ assignmentName, password });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Invalid assignment name or password.",
      });
    }

    const submissions = await Submission.find({ assignmentId: assignment._id });

    res.json({
      success: true,
      submissions: submissions,
    });
  } catch (error) {
    console.error(
      "Error verifying assignment and fetching submissions:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching submissions.",
    });
  }
});

module.exports = router;
