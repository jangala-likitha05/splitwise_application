const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");

router.post("/", async (req, res) => {
  try {
    const { name, userId, members = [] } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ message: "name and userId are required" });
    }

    const allMembers = [...new Set([userId, ...members])];

    const newGroup = new Group({
      name,
      createdBy: userId,
      members: allMembers,
    });

    await newGroup.save();

    res.status(201).json({
      message: "New Group Created",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const { userId } = req.body;
    const id = req.params.id;

    if (userId == null) {
      return res.status(400).json({ message: "User can never be null" });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: "group not found" });
    }
    group.members.push(userId);
    await group.save();

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    const groups = await Group.find({ members: userId });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Looking for ID:", id);

    const group = await Group.findById(id).populate("members");
    console.log("Found:", group);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server not found", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Expense.deleteMany({ group: req.params.id });
    await Settlement.deleteMany({ group: req.params.id });

    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
