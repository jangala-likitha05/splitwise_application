const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");

router.post("/:groupId/expenses", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { description, amount, paidBy } = req.body;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const splitAmount = amount / group.members.length;
    const splitBetween = group.members.map((memberId) => {
      return { user: memberId, amount: splitAmount };
    });

    const newExpense = new Expense({
      group: groupId,
      description,
      amount,
      paidBy,
      splitBetween,
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/:groupId/expenses", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const expenses = await Expense.find({ group: groupId }).populate("paidBy");

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});



router.get("/:groupId/balances", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);
    const expenses = await Expense.find({ group: groupId });
    const settlements = await Settlement.find({ group: groupId });

    console.log("Settlements found:", settlements);  // ADD THIS

    const balances = {};

    group.members.forEach((memberId) => {
      balances[memberId] = 0;
    });

    expenses.forEach((expense) => {
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach((split) => {
        balances[split.user] -= split.amount;
      });
    });

    settlements.forEach((settlement) => {
      console.log("Applying settlement:", settlement);  // ADD THIS
      balances[settlement.paidBy] += settlement.amount;
      balances[settlement.paidTo] -= settlement.amount;
    });

    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
