const express = require("express");
const router = express.Router();
const Student = require("./Student");
const Group = require("./Group");

router.post("/verifyStudent", async (req, res) => {
  const { studentName, rollNo, password, groupName } = req.body;

  try {
    const student = await Student.findOne({ name: studentName, rollNo });
    if (!student) {
      return res.json({ success: false, message: "Student does not exist." });
    }

    const group = await Group.findOne({ groupName, password });
    if (group) {
      return res.json({ success: true });
    } else {
      return res.json({
        success: false,
        message: "Incorrect group details or password.",
      });
    }
  } catch (error) {
    console.error("Error verifying student and group:", error);
    res.status(500).json({ error: "Error verifying student and group" });
  }
});

module.exports = router;
